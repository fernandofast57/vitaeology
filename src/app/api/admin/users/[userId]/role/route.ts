/**
 * API Admin - Gestione Ruolo Utente
 * PUT /api/admin/users/[userId]/role - Assegna ruolo
 * DELETE /api/admin/users/[userId]/role - Rimuovi ruolo
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPermissionFromRequest } from '@/lib/admin/verify-admin';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface RouteParams {
  params: { userId: string };
}

/**
 * PUT - Assegna un ruolo a un utente
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Verifica permesso users.roles.assign
  const auth = await verifyPermissionFromRequest('users.roles.assign');
  if (!auth.isAdmin) {
    return auth.response;
  }

  try {
    const { roleName } = await request.json();
    const { userId } = params;

    if (!roleName) {
      return NextResponse.json(
        { error: 'roleName richiesto' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Trova il ruolo
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id, name, level')
      .eq('name', roleName)
      .single();

    if (roleError || !role) {
      return NextResponse.json(
        { error: 'Ruolo non trovato' },
        { status: 404 }
      );
    }

    // Verifica che l'admin possa assegnare questo ruolo
    // (solo ruoli di livello inferiore, a meno che non sia super_admin)
    if (auth.roleName !== 'super_admin' && role.level >= auth.roleLevel) {
      return NextResponse.json(
        { error: 'Non puoi assegnare un ruolo di livello superiore o uguale al tuo' },
        { status: 403 }
      );
    }

    // Verifica che l'utente target esista
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role_id, roles(level)')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Non permettere di modificare utenti con ruolo superiore
    const targetLevel = (targetUser.roles as any)?.level ?? 0;
    if (auth.roleName !== 'super_admin' && targetLevel >= auth.roleLevel) {
      return NextResponse.json(
        { error: 'Non puoi modificare un utente con ruolo superiore o uguale al tuo' },
        { status: 403 }
      );
    }

    // Assegna il ruolo
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role_id: role.id,
        // Mantieni is_admin sincronizzato per compatibilità
        is_admin: role.level >= 80,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Errore assegnazione ruolo:', updateError);
      return NextResponse.json(
        { error: 'Errore assegnazione ruolo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Ruolo '${role.name}' assegnato a ${targetUser.email}`,
      user: {
        id: userId,
        email: targetUser.email,
        role: {
          id: role.id,
          name: role.name,
          level: role.level,
        },
      },
    });

  } catch (error) {
    console.error('Errore PUT role:', error);
    return NextResponse.json(
      { error: 'Errore interno' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Rimuovi ruolo da un utente (diventa cliente normale)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Verifica permesso users.roles.assign
  const auth = await verifyPermissionFromRequest('users.roles.assign');
  if (!auth.isAdmin) {
    return auth.response;
  }

  try {
    const { userId } = params;
    const supabase = getSupabaseClient();

    // Verifica che l'utente target esista
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role_id, roles(name, level)')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Non permettere di rimuovere ruolo a se stessi
    if (userId === auth.userId) {
      return NextResponse.json(
        { error: 'Non puoi rimuovere il tuo stesso ruolo' },
        { status: 403 }
      );
    }

    // Non permettere di modificare utenti con ruolo superiore
    const targetLevel = (targetUser.roles as any)?.level ?? 0;
    if (auth.roleName !== 'super_admin' && targetLevel >= auth.roleLevel) {
      return NextResponse.json(
        { error: 'Non puoi modificare un utente con ruolo superiore o uguale al tuo' },
        { status: 403 }
      );
    }

    // Rimuovi il ruolo
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role_id: null,
        is_admin: false,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Errore rimozione ruolo:', updateError);
      return NextResponse.json(
        { error: 'Errore rimozione ruolo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Ruolo rimosso da ${targetUser.email}. Ora è un cliente normale.`,
      user: {
        id: userId,
        email: targetUser.email,
        role: null,
      },
    });

  } catch (error) {
    console.error('Errore DELETE role:', error);
    return NextResponse.json(
      { error: 'Errore interno' },
      { status: 500 }
    );
  }
}
