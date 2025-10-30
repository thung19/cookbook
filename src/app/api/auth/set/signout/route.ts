import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabaseRoute';

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', req.url));
  const supabase = createSupabaseRouteClient(req, res);

  await supabase.auth.signOut();

  return res;
}