import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { prisma } from '@/lib/prisma';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', BASE));
  }

  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[/auth/welcome] exchange error:', error);
    return NextResponse.redirect(new URL('/login?error=exchange_failed', BASE));
  }

  const user = data.user;

  // Ensure user exists in Prisma database
  try {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { 
        email: user.email ?? '',
        username: user.user_metadata?.name || user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
      },
      create: {
        id: user.id,
        email: user.email ?? '',
        username: user.user_metadata?.name || user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
      },
    });
    console.log('[/auth/welcome] User synced to database:', user.id);
  } catch (e) {
    console.error('[/auth/welcome] prisma upsert error:', e);
  }

  res.headers.set('Location', new URL('/', BASE).toString());
  return new NextResponse(null, { status: 302, headers: res.headers });
}