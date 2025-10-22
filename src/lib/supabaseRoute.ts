// ===============================
// lib/supabaseRoute.ts
// ===============================
// This file creates a helper function for generating a **server-side Supabase client**
// specifically designed for Next.js Route Handlers and Middleware.
//
// Unlike the client version (`lib/supabase.ts`), this setup runs on the **server** and
// handles **cookies** automatically so Supabase can keep users signed in across requests.

import { createServerClient, type CookieOptions } from "@supabase/ssr"; // Import the server-aware Supabase client and cookie types
import { NextRequest, NextResponse } from "next/server";                 // Import Next.js Request/Response types for API routes

/**
 * createSupabaseRouteClient
 * --------------------------
 * Creates a Supabase client tied to the incoming Next.js request (`req`)
 * and outgoing response (`res`).
 *
 * This is needed because on the server, Supabase authentication relies on cookies
 * to track the user session (who is logged in, tokens, etc.).
 *
 * By defining how to read and write cookies below, we allow Supabase to:
 *  - Read existing session cookies from the incoming request.
 *  - Update them in the response when the session changes (e.g., login/logout).
 */
export function createSupabaseRouteClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    // 1️⃣ Your Supabase project’s base URL (from .env.local)
    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    // 2️⃣ The "anon" (public) API key used to authenticate this connection
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

    // 3️⃣ Cookie handling configuration (how Supabase reads/writes cookies)
    {
      cookies: {
        /**
         * Read cookies from the incoming request
         * ---------------------------------------
         * Supabase calls this when it needs to know which cookies
         * are currently set (for example, to retrieve the user's session).
         *
         * Here, we use Next.js’s built-in `req.cookies.getAll()` method
         * and format each cookie into the shape `{ name, value }`
         * that Supabase expects.
         */
        getAll() {
          return req.cookies.getAll().map(c => ({ name: c.name, value: c.value }));
        },

        /**
         * Write cookies to the outgoing response
         * ---------------------------------------
         * Supabase calls this when it needs to create, update, or delete cookies.
         * Example: when a user logs in, Supabase sends back new session cookies.
         *
         * We loop through all cookies that Supabase wants to set
         * and apply them to the Next.js response using `res.cookies.set()`.
         *
         * The `options` object (e.g., path, expiry) is cast to `CookieOptions`
         * for proper typing and autocompletion in TypeScript.
         */
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    }
  );
}
