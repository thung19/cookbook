import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabaseRoute";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { access_token, refresh_token } = body ?? {};

  if (!access_token || !refresh_token) {
    return new NextResponse("Missing tokens", { status: 400 });
  }

  // Create a NextResponse so the helper can set cookies on it
  const res = NextResponse.next();

  // createSupabaseRouteClient expects (req, res) to bind cookie helpers
  const supabase = createSupabaseRouteClient(req, res);

  // Set the server session (writes HTTP-only cookies)
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    console.error("supabase.auth.setSession error:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Return the response that now includes cookies set by the helper
  return res;
}