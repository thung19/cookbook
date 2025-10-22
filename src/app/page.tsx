// ======================================================
// src/app/page.tsx
// ======================================================
//
// 🔍 OVERVIEW
// This is the **Home Page** (route: `/`) of your application.
// It is a **Server Component** that runs entirely on the server side,
// allowing it to securely fetch both user authentication data and
// database records before sending HTML to the client.
//
// 🧩 How it fits into your stack:
//
// - Uses Supabase (via `createSupabaseServerClient`) to check
//   if a user is currently logged in.
// - Uses Prisma (via `prisma.recipe.findMany`) to query the database
//   for all existing recipes and their authors.
// - Renders a responsive grid of `<RecipeCard />` components.
// - Conditionally displays “Add Recipe” or “Login to Add Recipe”
//   depending on whether the user is authenticated.
//
// This page is the **main landing view** for your cooking web app —
// it lists the latest recipes and adapts the UI based on login state.
//

import Link from "next/link";                         // For client-side navigation between pages
import RecipeCard from "./components/RecipeCard/RecipeCard"; // Component that visually displays each recipe
import { prisma } from "@/lib/prisma";                // Prisma client for database queries
import { createSupabaseServerClient } from "@/lib/supabaseServer"; // Supabase client for server-side auth
import type { Recipe, User } from "@prisma/client";   // Prisma model types for TypeScript safety

// ------------------------------------------------------
// Type Definitions
// ------------------------------------------------------
//
// Combines the base `Recipe` model with its associated `User` (author).
// This composite type is used when rendering recipes that include author info.
export type RecipeWithAuthor = Recipe & { author: User };

// ------------------------------------------------------
// Home Component (default export)
// ------------------------------------------------------
//
// The main component for the home page.
// Since this is an async Server Component, it can use `await` directly
// to fetch data from Supabase and Prisma before rendering.
export default async function Home() {
  // Declare variables to store recipes, current user, and potential errors
  let recipes: RecipeWithAuthor[] = [];
  let user = null;
  let error = null;

  // ------------------------------------------------------
  // Data Fetching and Authentication
  // ------------------------------------------------------
  try {
    // 1️⃣ Create a Supabase client for the current server context
    const supabase = await createSupabaseServerClient();

    // 2️⃣ Retrieve the currently logged-in user (if any)
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;

    // 3️⃣ Query the database for all recipes, including author info.
    //     Results are ordered by most recent creation time.
    recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true },
    });
  } catch (err) {
    // 4️⃣ Catch and log any errors (e.g., DB connection issues)
    console.error("Error loading recipes:", err);
    error = err;
  }

  // ------------------------------------------------------
  // Error Handling UI
  // ------------------------------------------------------
  //
  // If an error occurred during data fetching, display a simple fallback UI
  // with an error message instead of breaking the app.
  if (error) {
    return (
      <main className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold mb-3">Latest Recipes</h1>
          <p className="text-red-500">
            Error loading recipes. Please try again later.
          </p>
        </section>
      </main>
    );
  }

  // ------------------------------------------------------
  // Main Page UI
  // ------------------------------------------------------
  //
  // This section renders the page when no errors occurred.
  // It includes:
  //  - A page header
  //  - Conditional button logic (Add Recipe vs Login)
  //  - The recipe grid or a "no recipes" message
  return (
    <main className="space-y-6">
      <section>
        {/* Header and action button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-3">Latest Recipes</h1>

          {/* Show different buttons depending on login state */}
          {user ? (
            // If the user is logged in → show “Add Recipe”
            <Link
              href="/recipes/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Recipe
            </Link>
          ) : (
            // If the user is not logged in → show “Login to Add Recipe”
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Login to Add Recipe
            </Link>
          )}
        </div>

        {/* Conditional rendering for empty or populated recipe lists */}
        {recipes.length === 0 ? (
          // No recipes exist yet
          <p className="text-sm text-gray-500">
            No recipes yet —{" "}
            {user ? (
              <Link href="/recipes/new" className="underline">
                add one
              </Link>
            ) : (
              <Link href="/login" className="underline">
                login to add one
              </Link>
            )}
            .
          </p>
        ) : (
          // Render recipe grid using the RecipeCard component
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
