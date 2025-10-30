import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabaseRoute';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { access_token, refresh_token } = body ?? {};

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    const supabase = createSupabaseRouteClient(req, res);

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      console.error('[/api/auth/set] supabase.auth.setSession error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ✅ Ensure user exists in database after setting session
    if (data.user) {
      try {
        await prisma.user.upsert({
          where: { id: data.user.id },
          update: { 
            email: data.user.email ?? '',
            username: data.user.user_metadata?.name || data.user.email?.split('@')[0] || `user_${data.user.id.slice(0, 8)}`,
          },
          create: {
            id: data.user.id,
            email: data.user.email ?? '',
            username: data.user.user_metadata?.name || data.user.email?.split('@')[0] || `user_${data.user.id.slice(0, 8)}`,
          },
        });
        console.log('[/api/auth/set] User synced to database:', data.user.id);
      } catch (e) {
        console.error('[/api/auth/set] prisma upsert error:', e);
      }
    }

    res.headers.set('x-supabase-session', 'set');
    return res;
  } catch (err) {
    console.error('[/api/auth/set] unexpected error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}