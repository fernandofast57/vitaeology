import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Verifica autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin/users');
  }

  // Verifica se utente è admin (is_admin legacy O role level >= 80)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      is_admin,
      role_id,
      roles (level)
    `)
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Errore caricamento profilo admin:', profileError);
    redirect('/dashboard?error=profile_error');
  }

  const roleLevel = (profile?.roles as any)?.level ?? 0;
  const isAdmin = profile?.is_admin === true || roleLevel >= 80;

  if (!isAdmin) {
    redirect('/dashboard?error=unauthorized');
  }

  return <>{children}</>;
}
