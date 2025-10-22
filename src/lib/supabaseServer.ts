// ======================================================
// lib/supabaseServer.ts
// ======================================================
//
// 🔍 OVERVIEW
// This file defines a helper function (`createSupabaseServerClient`) that creates
// a Supabase client specifically for **Next.js Server Components** and **Server Actions**.
//
// In your app, Supabase can be used in three main environments:
//
// 1. 🧭 Client Components → use `lib/supabase.ts`
//    - Runs in the browser and interacts directly with Supabase using the public anon key.
//    - Handles things like login, sign-up, and real-time updates.
//
// 2. ⚙️ API Routes / Middleware → use `lib/supabaseRoute.ts`
//    - Runs on the server inside Route Handlers or middleware.
//    - Reads/writes cookies from `NextRequest` and `NextResponse` objects.
//
// 3. 🧩 Server Components / Server Actions → use **this file** (`lib/supabaseServer.ts`)
//    - Runs on the server during rendering (no access to `window` or request/response).
//    - Uses Next.js’s built-in `cookies()` API to read/write auth cookies.
//    - Allows you to fetch Supabase data securely during SSR (Server-Side Rendering).
//
// Together, these three files (`supabase.ts`, `supabaseRoute.ts`, `supabaseServer.ts`)
// ensure that your app can use Supabase consistently across **all layers** of a Next.js app.
//

import { cookies } from "next/headers";           // Gives access to HTTP cookies during server rendering
import { createServerClient } from "@supabase/ssr"; // Supabase's server-side client, optimized for SSR use

/**
 * createSupabaseServerClient
 * --------------------------
 * Creates and returns a Supabase client instance that can be used inside
 * **Next.js Server Components** or **Server Actions**.
 *
 * - Uses Next.js’s `cookies()` API to read the current user session.
 * - Allows Supabase to authenticate requests during SSR.
 * - Automatically updates cookies when sessions are refreshed or changed.
 *
 * Example usage:
 * ```ts
 * const supabase = await createSupabaseServerClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 */
export async function createSupabaseServerClient() {
  // Get the cookie store for the current request context.
  // This gives you access to read and write cookies (auth tokens, session info, etc.).
  const cookieStore = await cookies();

  // Create and return a Supabase client instance that knows how to handle cookies.
  return createServerClient(
    // 1️⃣ Your Supabase project URL (from .env.local)
    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    // 2️⃣ The public "anon" key used to access Supabase services.
    // The exclamation mark (!) is a non-null assertion (TypeScript syntax) —
    // it tells the compiler that these environment variables definitely exist.
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

    // 3️⃣ Configuration object that defines how Supabase will read/write cookies
    {
      cookies: {
        /**
         * getAll()
         * ---------
         * Called internally by Supabase whenever it needs to check for
         * existing cookies (e.g., to identify the current session or user).
         * Returns an array of all cookies currently present on the request.
         */
        getAll() {
          return cookieStore.getAll();
        },

        /**
         * setAll(cookiesToSet)
         * --------------------
         * Called when Supabase wants to write or update cookies,
         * such as when a user logs in, logs out, or renews their session.
         *
         * Server Components don’t always allow direct cookie modifications
         * (they are often static and don’t have a response object).
         * For that reason, this logic is wrapped in a try/catch block:
         * - If cookies can be set, great.
         * - If not, it silently fails and your middleware can refresh the session.
         */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options) // Write each cookie to the response
            );
          } catch {
            // Called inside a Server Component where cookies can't be set directly.
            // Safe to ignore because session-refreshing middleware will handle it.
          }
        },
      },
    }
  );
}

// ----------------------------------------------------
// Alias for backward compatibility
// ----------------------------------------------------
// Some older parts of the app (or older examples) might still import
// this helper as `getSupabaseServer()`. This alias ensures those imports
// continue to work without modification.
export const getSupabaseServer = createSupabaseServerClient;
