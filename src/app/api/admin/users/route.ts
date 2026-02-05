/**
 * API Admin - Lista Utenti
 * GET /api/admin/users - Lista tutti gli utenti con ruoli e subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/service';
import { verifyPermissionFromRequest } from '@/lib/admin/verify-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verifica permesso users.view
  const auth = await verifyPermissionFromRequest('users.view');
  if (!auth.isAdmin) {
    return auth.response;
  }

  try {
    const supabase = getSupabaseClient();

    // Parametri query
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Query base
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        subscription_tier,
        subscription_status,
        is_admin,
        role_id,
        user_type,
        created_at,
        updated_at,
        roles (
          id,
          name,
          display_name,
          level
        )
      `, { count: 'exact' });

    // Filtro ricerca
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Filtro ruolo
    if (roleFilter === 'staff') {
      // Solo utenti con ruolo (staff/admin)
      query = query.not('role_id', 'is', null);
    } else if (roleFilter === 'clients') {
      // Solo clienti (senza ruolo)
      query = query.is('role_id', null);
    } else if (roleFilter) {
      // Ruolo specifico - trova prima l'ID
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleFilter)
        .single();

      if (role) {
        query = query.eq('role_id', role.id);
      }
    }

    // Ordinamento e paginazione
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Errore query utenti:', error);
      return NextResponse.json(
        { error: 'Errore caricamento utenti' },
        { status: 500 }
      );
    }

    // Carica lista ruoli disponibili
    const { data: roles } = await supabase
      .from('roles')
      .select('id, name, display_name, level, description')
      .order('level', { ascending: false });

    return NextResponse.json({
      users: users || [],
      roles: roles || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    console.error('Errore API users:', error);
    return NextResponse.json(
      { error: 'Errore interno' },
      { status: 500 }
    );
  }
}
