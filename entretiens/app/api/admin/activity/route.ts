import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
  }

  // Mode 1: Service Role disponible -> utiliser l'Admin API Auth
  if (serviceKey) {
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    try {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      const users = (data?.users || []).map(u => ({
        auth_id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: (u as any).last_sign_in_at || null,
      }));
      return NextResponse.json({ users, source: 'auth-admin' });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Failed to fetch admin activity (service role)' }, { status: 500 });
    }
  }

  // Mode 2: Fallback avec clé anonyme -> lire depuis la table Utilisateur
  if (!anonKey) {
    return NextResponse.json({
      error: 'Missing SUPABASE_SERVICE_ROLE_KEY for Auth admin API and NEXT_PUBLIC_SUPABASE_ANON_KEY for fallback.'
    }, { status: 500 });
  }

  try {
    const client = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client
      .from('Utilisateur')
      .select('auth_id,email,created_at')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (error) throw error;
    const users = (data || []).map(u => ({
      auth_id: (u as any).auth_id,
      email: (u as any).email,
      created_at: (u as any).created_at,
      last_sign_in_at: null as any,
    }));
    return NextResponse.json({ users, source: 'utilisateur-fallback' });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch fallback activity' }, { status: 500 });
  }
}
