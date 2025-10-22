// ======================================================
// middleware.ts
// ======================================================
//
// 🔍 OVERVIEW
// This file defines global middleware that runs **before every request**
// to your Next.js application.
//
// It uses the `@supabase/auth-helpers-nextjs` package to automatically:
//   - Verify if a user is authenticated
//   - Refresh expired Supabase sessions
//   - Redirect users based on authentication state
//
// ⚙️ Relationship to the rest of your app:
//
//   - `lib/supabase.ts` → Client-side Supabase (used in React components)
//   - `lib/supabaseServer.ts` → Server Components / Server Actions (SSR)
//   - `lib/supabaseRoute.ts` → API routes / route handlers
//   - **`middleware.ts` → Global gatekeeper**
//       Handles authentication checks and route access control *before* requests reach your pages.
//
// Together, these pieces ensure that user sessions are consistent,
// refreshed automatically, and protected across the entire app.
//

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs' // Helper to create a Supabase client within middleware
import { NextResponse } from 'next/server'                              // Used to create and modify the outgoing HTTP response
import type { NextRequest } from 'next/server'                          // TypeScript type for incoming requests

/**
 * middleware
 * ----------
 * This function runs before every page or API request.
 * It checks the current user's authentication state using Supabase,
 * and redirects users appropriately based on whether they are logged in or not.
 */
export async function middleware(req: NextRequest) {
  // Create a Next.js response object that can be modified by this middleware
  const res = NextResponse.next()

  // Create a Supabase client tied to the current request and response.
  // This allows Supabase to read and update auth cookies automatically.
  const supabase = createMiddlewareClient({ req, res })

  // Retrieve the current user session from Supabase.
  // If no user is logged in, `session` will be null.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // ------------------------------------------------------
  // PUBLIC ROUTES — these pages can be accessed by anyone
  // ------------------------------------------------------
  // Define a list of routes that should remain accessible even if the user
  // is not signed in (e.g., login, sign-up, password reset, etc.).
  const publicRoutes = [
    '/login',
    '/signup',
    '/auth/welcome',
    '/reset-password',
    '/reset-password/confirm',
  ]

  // Check if the current request path matches any of the public routes.
  const isPublicRoute = publicRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )

  // ------------------------------------------------------
  // ACCESS CONTROL LOGIC
  // ------------------------------------------------------

  // 🔒 Case 1: User is NOT signed in and trying to access a protected route
  // Redirect them to the `/login` page.
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 🔓 Case 2: User IS signed in and tries to access login or signup pages
  // Redirect them away (usually to the home page) to prevent redundant access.
  if (
    session &&
    (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')
  ) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // ✅ Case 3: All other cases (user allowed)
  // Continue the request to the intended destination.
  return res
}

// ======================================================
// Middleware Configuration
// ======================================================
//
// The `config.matcher` property tells Next.js which routes
// this middleware should run on. Here, it excludes static assets,
// image optimization routes, and files like the favicon.
//
// This ensures the middleware only runs on actual pages and API routes.
//
export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static       → static build files
     * - _next/image        → Next.js image optimization routes
     * - favicon.ico        → site icon
     * - image assets       → svg, png, jpg, etc.
     * - public/ files      → anything served directly from /public
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
