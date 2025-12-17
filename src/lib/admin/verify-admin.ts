/**
 * Utility per verificare se un utente è admin
 */

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Verifica se un userId è admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  return profile?.is_admin === true;
}

/**
 * Verifica admin da email
 */
export async function isEmailAdmin(email: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data: user } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single();

  if (!user) return false;

  return isUserAdmin(user.id);
}

/**
 * Lista email admin hardcoded (fallback)
 */
const ADMIN_EMAILS = [
  'fernando@vitaeology.com',
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Verifica admin da API request (usa cookies della sessione)
 * Ritorna { isAdmin: true, userId } se admin, altrimenti { isAdmin: false, response: NextResponse }
 */
export async function verifyAdminFromRequest(): Promise<
  { isAdmin: true; userId: string } | { isAdmin: false; response: NextResponse }
> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { error: 'Non autenticato' },
          { status: 401 }
        ),
      };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { error: 'Non autorizzato - accesso admin richiesto' },
          { status: 403 }
        ),
      };
    }

    return { isAdmin: true, userId: user.id };
  } catch (error) {
    console.error('Errore verifica admin:', error);
    return {
      isAdmin: false,
      response: NextResponse.json(
        { error: 'Errore verifica autorizzazione' },
        { status: 500 }
      ),
    };
  }
}
