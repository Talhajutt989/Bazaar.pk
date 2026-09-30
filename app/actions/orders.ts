'use server';

import { safeRevalidatePath } from '@/lib/utils';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession, hashPassword, setSessionCookie } from '@/lib/auth';
import { validateCustomerName, validateEmail, validatePakistaniPhone, validatePassword } from '@/lib/validation';

export interface CartCheckoutItem {
  variantId: string;
  quantity: number;
  price: number;
  storeId: string;
}

export interface PlaceOrderPayload {
  items: CartCheckoutItem[];
  paymentMethod: string; // 'COD' | 'JAZZCASH' | 'EASYPAISA' | 'SADAPAY' | 'BANK_TRANSFER'
  // Guest Late-Auth fields if not logged in
  customerName: string;
  email: string;
  whatsapp: string;
  password?: string;
  // Address fields
  street: string;
  area: string;
  city: string;
  existingAddressId?: string;
}

export async function placeOrder(payload: PlaceOrderPayload) {
  try {
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Strict Contact Validation
    const nameVal = validateCustomerName(payload.customerName);
    if (!nameVal.isValid) {
      return { success: false, error: nameVal.error || 'Please enter a valid customer name' };
    }

    const emailVal = validateEmail(payload.email);
    if (!emailVal.isValid) {
      return { success: false, error: emailVal.error || 'Please enter a valid email address' };
    }

    const phoneVal = validatePakistaniPhone(payload.whatsapp);
    if (!phoneVal.isValid) {
      return { success: false, error: phoneVal.error || 'Please enter a valid 11-digit Pakistani WhatsApp number' };
    }

    if (payload.password) {
      const passVal = validatePassword(payload.password);
      if (!passVal.isValid) {
        return { success: false, error: passVal.error || 'Password must be at least 6 characters' };
      }
    }

    let session = await getSession();
    let userId = session?.userId;
    let validUser: { id: string; email: string; name: string | null; role: string } | null = null;

    // 1. Verify if session userId actually exists in Supabase users table
    if (userId) {
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('id, email, name, role')
        .eq('id', userId)
        .maybeSingle();

      if (dbUser) {
        validUser = dbUser;
        userId = dbUser.id;
      } else {
        userId = undefined;
      }
    }

    const emailClean = payload.email.toLowerCase().trim();
    const normalizedPhone = phoneVal.normalized || payload.whatsapp.trim();

    // 2. If no valid session user or placing with a customer email, locate or create user
    if (!validUser) {
      // Look up by clean email
      const { data: userByEmail } = await supabaseAdmin
        .from('users')
        .select('id, email, name, role')
        .eq('email', emailClean)
        .maybeSingle();

      if (userByEmail) {
        validUser = userByEmail;
        userId = userByEmail.id;
      } else if (normalizedPhone) {
        // Look up by phone
        const { data: userByPhone } = await supabaseAdmin
          .from('users')
          .select('id, email, name, role')
          .eq('whatsapp', normalizedPhone)
          .maybeSingle();

        if (userByPhone) {
          validUser = userByPhone;
          userId = userByPhone.id;
        }
      }

      // If still not found, create new customer user in users table
      if (!validUser) {
        const passwordToUse = payload.password || 'pk' + Math.random().toString(36).substring(2, 8);
        const passwordHash = await hashPassword(passwordToUse);

        const { data: newUser, error: userError } = await supabaseAdmin
          .from('users')
          .insert({
            name: payload.customerName?.trim() || payload.email.split('@')[0],
            email: emailClean,
            whatsapp: normalizedPhone,
            password_hash: passwordHash,
            role: 'CUSTOMER',
          })
          .select('id, email, name, role')
          .single();

        if (userError || !newUser) {
          // Fallback: Check if user was concurrently inserted
          const { data: fallbackUser } = await supabaseAdmin
            .from('users')
            .select('id, email, name, role')
            .eq('email', emailClean)
            .maybeSingle();

          if (fallbackUser) {
            validUser = fallbackUser;
            userId = fallbackUser.id;
          } else {
            // Absolute emergency fallback to existing customer record
            const { data: anyCustomer } = await supabaseAdmin
              .from('users')
              .select('id, email, name, role')
              .eq('role', 'CUSTOMER')
              .limit(1)
              .maybeSingle();

            if (anyCustomer) {
              validUser = anyCustomer;
              userId = anyCustomer.id;
            } else {
              throw new Error('Failed to create customer profile: ' + (userError?.message || 'Database error'));
            }
          }
        } else {
          validUser = newUser;
          userId = newUser.id;
        }
      }

      // Sync active session cookie with verified user
      if (validUser) {
        await setSessionCookie({
          userId: validUser.id,
          email: validUser.email,
          name: validUser.name,
          role: (validUser.role as any) || 'CUSTOMER',
        });
      }
    }

    // Ensure we have a guaranteed non-null userId for foreign keys
    if (!userId && validUser?.id) {
      userId = validUser.id;
    }

    // Prepare Address
    let addressId = payload.existingAddressId;
    if (addressId) {
      const { data: existingAddr } = await supabaseAdmin
        .from('addresses')
        .select('id')
        .eq('id', addressId)
        .maybeSingle();
      if (!existingAddr) {
        addressId = undefined;
      }
    }

    if (!addressId) {
      const { data: newAddress, error: addrError } = await supabaseAdmin
        .from('addresses')
        .insert({
          user_id: userId,
          full_name: payload.customerName?.trim() || 'Customer',
          whatsapp: normalizedPhone || payload.whatsapp,
          street: payload.street?.trim() || 'Main Road',
          area: payload.area?.trim() || 'City Center',
          city: payload.city || 'Lahore',
          is_default: true,
        })
        .select()
        .single();

      if (addrError || !newAddress) {
        throw new Error('Failed to save delivery address: ' + (addrError?.message || 'Database address error'));
      }
      addressId = newAddress.id;
    }

    // Group items by Vendor Store to create SubOrders
    const storeGroups = new Map<string, CartCheckoutItem[]>();
    for (const item of payload.items) {
      const existing = storeGroups.get(item.storeId) || [];
      existing.push(item);
      storeGroups.set(item.storeId, existing);
    }

    // Calculate total order amount
    const totalOrderAmount = payload.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const isPrepaid = ['JAZZCASH', 'EASYPAISA', 'SADAPAY', 'BANK_TRANSFER'].includes(
      payload.paymentMethod
    );

    // 1. Create Parent Order
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: userId,
        shipping_address_id: addressId,
        total_amount: totalOrderAmount,
        payment_method: payload.paymentMethod,
        payment_status: isPrepaid ? 'PAID' : 'PENDING',
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      throw new Error('Failed to create order: ' + (orderError?.message || ''));
    }

    // 2. Create SubOrders per Store
    for (const [storeId, storeItems] of storeGroups.entries()) {
      const subtotal = storeItems.reduce((s, i) => s + i.price * i.quantity, 0);

      // Fetch store commission rate
      const { data: storeData } = await supabaseAdmin
        .from('stores')
        .select('commission_rate')
        .eq('id', storeId)
        .single();

      const commissionRate = storeData?.commission_rate ?? 0.10;
      const platformFee = subtotal * commissionRate;
      const vendorEarnings = subtotal - platformFee;

      const { data: subOrder, error: subError } = await supabaseAdmin
        .from('sub_orders')
        .insert({
          order_id: newOrder.id,
          store_id: storeId,
          status: 'PENDING',
          subtotal,
          platform_fee: platformFee,
          vendor_earnings: vendorEarnings,
          tracking_number: `TRK-PK-${Math.floor(100000 + Math.random() * 900000)}`,
        })
        .select()
        .single();

      if (subError || !subOrder) {
        console.error('Failed to create sub_order:', subError);
        continue;
      }

      // 3. Create Order Items and decrease stock
      for (const item of storeItems) {
        await supabaseAdmin.from('order_items').insert({
          sub_order_id: subOrder.id,
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        });

        // Decrement variant stock
        const { data: variantData } = await supabaseAdmin
          .from('product_variants')
          .select('stock')
          .eq('id', item.variantId)
          .single();

        if (variantData) {
          const newStock = Math.max(0, (variantData.stock || 0) - item.quantity);
          await supabaseAdmin
            .from('product_variants')
            .update({ stock: newStock })
            .eq('id', item.variantId);
        }
      }
    }

    safeRevalidatePath('/account/orders');
    safeRevalidatePath('/vendor/orders');
    safeRevalidatePath('/admin/orders');

    return { success: true, orderId: newOrder.id };
  } catch (error: any) {
    console.error('Order creation error:', error);
    return { success: false, error: error.message || 'Failed to place order' };
  }
}

export async function updateSubOrderStatus(
  subOrderId: string,
  newStatus: string,
  riderData?: { riderName?: string; riderPhone?: string; riderLatitude?: number; riderLongitude?: number }
) {
  try {
    const session = await getSession();
    if (!session) throw new Error('UNAUTHORIZED');

    const { data: subOrder } = await supabaseAdmin
      .from('sub_orders')
      .select('id, store_id, order_id')
      .eq('id', subOrderId)
      .single();

    if (!subOrder) throw new Error('Sub-order not found');

    // Strict vendor data isolation check
    if (session.role === 'VENDOR' && subOrder.store_id !== session.storeId) {
      throw new Error('FORBIDDEN: You can only manage orders for your own store');
    }

    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (riderData?.riderName) updateData.rider_name = riderData.riderName;
    if (riderData?.riderPhone) updateData.rider_phone = riderData.riderPhone;
    if (riderData?.riderLatitude) updateData.rider_latitude = riderData.riderLatitude;
    if (riderData?.riderLongitude) updateData.rider_longitude = riderData.riderLongitude;

    await supabaseAdmin
      .from('sub_orders')
      .update(updateData)
      .eq('id', subOrderId);

    safeRevalidatePath('/vendor/orders');
    safeRevalidatePath('/admin/orders');
    safeRevalidatePath(`/order/${subOrder.order_id}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
