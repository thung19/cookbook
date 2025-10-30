import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabaseRoute';

/**
 * POST /api/auth/signout
 * Signs out the user and clears auth cookies, then redirects to /login
 */
export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', req.url));
  const supabase = createSupabaseRouteClient(req, res);

  await supabase.auth.signOut();

  return res;
}
