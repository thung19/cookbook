// app/auth/welcome/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseRouteClient } from "@/lib/supabaseRoute";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseRouteClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", BASE));

  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email ?? undefined },
    create: {
      id: user.id,
      email: user.email ?? "",
      username: `user_${user.id.slice(0, 8)}`,
    },
  });

  return NextResponse.redirect(new URL("/", BASE));
}
