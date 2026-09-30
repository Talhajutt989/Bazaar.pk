import { cookies } from 'next/headers';
import { cache } from 'react';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

const COOKIE_NAME = 'hyperlocal_session';

export interface SessionData {
  userId: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER';
  storeId?: string;
  storeName?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setSessionCookie(data: SessionData) {
  try {
    const cookieStore = await cookies();
    const serialized = Buffer.from(JSON.stringify(data)).toString('base64');
    
    cookieStore.set(COOKIE_NAME, serialized, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  } catch (err) {
    // Gracefully ignore if called outside Next.js HTTP request scope (e.g. unit tests or scripts)
  }
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch (err) {
    // Gracefully ignore if called outside request context
  }
}

export const getSession = cache(async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const json = Buffer.from(cookie.value, 'base64').toString('utf-8');
    const session: SessionData = JSON.parse(json);
    return session;
  } catch {
    return null;
  }
});

export async function requireAuth(allowedRoles?: ('ADMIN' | 'VENDOR' | 'CUSTOMER')[]) {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error('FORBIDDEN');
  }

  return session;
}

const GUEST_COOKIE_NAME = 'hyperlocal_guest_id';

/**
 * Returns the effective user ID for the current visitor.
 * If user is logged in, returns their session.userId.
 * If guest, looks up or creates a unique guest customer record in Supabase and sets a persistent cookie.
 */
export async function getEffectiveUserId(): Promise<string> {
  // 1. Check logged-in session
  try {
    const session = await getSession();
    if (session?.userId) {
      return session.userId;
    }
  } catch {}

  // 2. Check guest cookie
  let guestCookieValue: string | undefined;
  try {
    const cookieStore = await cookies();
    const guestCookie = cookieStore.get(GUEST_COOKIE_NAME);
    guestCookieValue = guestCookie?.value;
  } catch {}

  if (guestCookieValue) {
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', guestCookieValue)
      .maybeSingle();

    if (existingUser) {
      return existingUser.id;
    }
  }

  // 3. Create unique guest user in Supabase
  try {
    const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@guest.pk`;
    const { data: guestUser, error: gErr } = await supabaseAdmin
      .from('users')
      .insert({
        name: 'Verified Customer',
        email: guestEmail,
        password_hash: 'GUEST_ACCOUNT_NOLOGIN',
        role: 'CUSTOMER',
      })
      .select('id')
      .single();

    if (guestUser) {
      try {
        const cookieStore = await cookies();
        cookieStore.set(GUEST_COOKIE_NAME, guestUser.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 60, // 60 days
          path: '/',
        });
      } catch {}

      return guestUser.id;
    }
  } catch (err) {
    console.error('Error generating guest user in Supabase:', err);
  }

  // 4. Guaranteed valid customer ID fallback (query any customer in users table)
  const { data: defaultCustomer } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('role', 'CUSTOMER')
    .limit(1)
    .maybeSingle();

  return defaultCustomer?.id || '0c93d543-621c-48da-be71-64d17bc9d24d';
}

/**
 * Non-mutating version of getEffectiveUserId for read-only Server Components
 */
export const getEffectiveUserIdReadOnly = cache(async function getEffectiveUserIdReadOnly(): Promise<string | null> {
  try {
    const session = await getSession();
    if (session?.userId) return session.userId;
    const cookieStore = await cookies();
    const guestCookie = cookieStore.get(GUEST_COOKIE_NAME);
    return guestCookie?.value || null;
  } catch {
    return null;
  }
});

