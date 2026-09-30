import { supabaseAdmin } from '../lib/supabase';
import bcrypt from 'bcryptjs';

async function seedAllPreviousAccounts() {
  const defaultHash = await bcrypt.hash('password123', 10);

  const accounts = [
    { email: 'admin@marketplace.pk', name: 'Super Admin', role: 'ADMIN', whatsapp: '+923000000001' },
    { email: 'customer@marketplace.pk', name: 'Zainab Fatima (Customer)', role: 'CUSTOMER', whatsapp: '+923007654321' },
    { email: 'hamza@marketplace.pk', name: 'Hamza Tariq', role: 'CUSTOMER', whatsapp: '+923009876543' },
    { email: 'ayesha@marketplace.pk', name: 'Ayesha Malik', role: 'CUSTOMER', whatsapp: '+923001122334' },
    { email: 'bilal@marketplace.pk', name: 'Bilal Ahmed', role: 'CUSTOMER', whatsapp: '+923005544332' },
    { email: 'vendor.tech@marketplace.pk', name: 'Hamza Malik (Tech Hub)', role: 'VENDOR', whatsapp: '+923001234567', storeId: 'store_lahore_tech' },
    { email: 'vendor.fresh@marketplace.pk', name: 'Bilal Farooq (Fresh Mart)', role: 'VENDOR', whatsapp: '+923219876543', storeId: 'store_karachi_fresh' },
    { email: 'vendor.apparel@marketplace.pk', name: 'Ayesha Siddiqui (Couture)', role: 'VENDOR', whatsapp: '+923335554433', storeId: 'store_islamabad_apparel' },
    { email: 'vendor.dryfruits@marketplace.pk', name: 'Khan Zaman (Khyber Goods)', role: 'VENDOR', whatsapp: '+923451122334', storeId: 'store_khyber_dryfruits' },
    { email: 'vendor.decor@marketplace.pk', name: 'Usman Tariq (Loom Craft)', role: 'VENDOR', whatsapp: '+923126677889', storeId: 'store_faisalabad_decor' },
    { email: 'vendor.organic@marketplace.pk', name: 'Zubair Qureshi (Botanicals)', role: 'VENDOR', whatsapp: '+923314455667', storeId: 'store_rawalpindi_organic' },
    { email: 'vendor@marketplace.pk', name: 'Hamza Malik', role: 'VENDOR', whatsapp: '+923001234567', storeId: 'store_lahore_mart' },
    { email: 'bilal.farooq@gmail.com', name: 'Bilal Farooq', role: 'VENDOR', whatsapp: '+923219876543', storeId: 'store_karachi_dryfruits' },
    { email: 'vendor@bazaar.pk', name: 'Store Owner', role: 'VENDOR', whatsapp: '+923001234567', storeId: 'store_islamabad_tech' },
  ];

  console.log('Seeding', accounts.length, 'accounts...');

  for (const acc of accounts) {
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', acc.email)
      .maybeSingle();

    let userId = existing?.id;

    if (!existing) {
      const { data: created, error } = await supabaseAdmin
        .from('users')
        .insert({
          name: acc.name,
          email: acc.email,
          whatsapp: acc.whatsapp,
          password_hash: defaultHash,
          role: acc.role,
        })
        .select('id')
        .single();
      if (error) {
        console.error('Error creating', acc.email, error.message);
      } else {
        userId = created.id;
        console.log('Created user:', acc.email);
      }
    } else {
      await supabaseAdmin.from('users').update({
        password_hash: defaultHash,
        role: acc.role,
        name: acc.name,
      }).eq('id', existing.id);
      console.log('Updated user:', acc.email);
    }

    if (acc.storeId && userId) {
      await supabaseAdmin.from('stores').update({ user_id: userId }).eq('id', acc.storeId);
      console.log('Linked store', acc.storeId, 'to', acc.email);
    }
  }

  console.log('ALL ACCOUNTS READY!');
}

seedAllPreviousAccounts().catch(console.error);
