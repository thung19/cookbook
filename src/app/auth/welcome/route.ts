// ======================================================
// src/app/auth/welcome/route.ts
// ======================================================
//
// 🔍 OVERVIEW
// This route runs when a user is redirected back from Supabase
// after signing up or logging in (for example via email link or OAuth).
//
// 🧩 Flow summary:
//  1️⃣ Supabase sends the user back to `/auth/welcome` after auth.
//  2️⃣ This route verifies the Supabase session and retrieves the user.
//  3️⃣ It ensures the user exists in your local Prisma `User` table
//      (creating or updating the record as needed).
//  4️⃣ Then it redirects the user to your app’s home page (`/`).
//
// ⚙️ It’s implemented as a **GET** route handler (`export async function GET`)
//    and runs on the **server** (Node or Edge runtime).
//

import { NextResponse, type NextRequest } from "next/server";
// `NextRequest` → the incoming HTTP request (provides cookies, URL, headers).
// `NextResponse` → helper for creating responses, redirects, JSON, etc.

import { prisma } from "@/lib/prisma";
// Prisma client to interact with your Supabase Postgres database.

import { createSupabaseRouteClient } from "@/lib/supabaseRoute";
// Utility function that creates a Supabase client bound to the request/response.
// Handles cookie management automatically for SSR or route handlers.

// Define a fallback base URL for redirects (useful for local dev).
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ------------------------------------------------------
// GET HANDLER
// ------------------------------------------------------
//
// Called whenever the user lands on /auth/welcome (via GET).
// This verifies the Supabase session, syncs user data with your DB,
// and finally redirects the user home.
//
export async function GET(req: NextRequest) {
  // `NextResponse.next()` creates a pass-through response that we can attach cookies to.
  const res = NextResponse.next();

  // Create a Supabase client bound to this request/response pair.
  // This allows `supabase.auth.getUser()` to read the auth cookie or tokens.
  const supabase = createSupabaseRouteClient(req, res);

  // Retrieve the authenticated user (if any) from Supabase session.
  // The shape is: { data: { user: { id, email, ... } }, error }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ------------------------------------------------------
  // AUTH CHECK
  // ------------------------------------------------------
  //
  // If no user session exists (not logged in or invalid link),
  // redirect the user back to the login page.
  if (!user) return NextResponse.redirect(new URL("/login", BASE));

  // ------------------------------------------------------
  // UPSERT USER INTO DATABASE
  // ------------------------------------------------------
  //
  // The `upsert()` call ensures the user exists in the local `User` table.
  // - If a user with this ID already exists → update their email.
  // - Otherwise, create a new record with a default username.
  //
  // Prisma syntax:
  //   prisma.user.upsert({
  //     where: { id: ... },
  //     update: { ... },
  //     create: { ... }
  //   })
  //
  // Note: `user.id` and `user.email` come from Supabase auth metadata.
  await prisma.user.upsert({
    where: { id: user.id }, // Match by Supabase user ID (primary key).
    update: {
      email: user.email ?? undefined, // Update email if present.
    },
    create: {
      id: user.id,                    // Use same UUID as Supabase Auth user.
      email: user.email ?? "",        // Default to empty string if missing.
      username: `user_${user.id.slice(0, 8)}`, // Simple default username pattern.
    },
  });

  // ------------------------------------------------------
  // REDIRECT TO HOME PAGE
  // ------------------------------------------------------
  //
  // Once user data is synced, redirect them to the main page (`/`).
  // Using `BASE` ensures proper origin (e.g., localhost or production doma
