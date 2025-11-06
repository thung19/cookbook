// ======================================================
// src/app/recipes/page.tsx
// ======================================================
//
// 🔍 OVERVIEW
// This file defines the **Recipes Page** of your app (route: `/recipes`).
// It is a **Server Component** that fetches all recipe records from your
// Supabase PostgreSQL database via Prisma and renders them in a responsive grid.
//
// 🧩 How it fits into your stack:
//
// - Uses Prisma (`lib/prisma.ts`) to fetch all recipes from your database.
// - Uses the reusable `RecipeCard` component to display each recipe.
// - Provides a link for users to navigate to the “Add Recipe” page.
// - Automatically server-renders the recipe list whenever the page is loaded.
//
// Since this component uses Prisma and no client-side interactivity,
// it runs **entirely on the server**, ensuring optimal performance and SEO.
//

import Link from "next/link";                          // Client-side navigation between pages
import RecipeCard from "../components/RecipeCard/RecipeCard"; // Component for displaying individual recipe previews
import { prisma } from "@/lib/prisma";                 // Prisma client for database access
import type { Recipe } from "@prisma/client";          // Prisma model type for TypeScript safety

// ------------------------------------------------------
// Page Metadata
// ------------------------------------------------------
//
// This metadata object sets the <title> for the page,
// which is automatically included by Next.js in the HTML <head>.
export const metadata = {
  title: "All Recipes",
};

type RecipeWithAuthor = Recipe & {author : User};

// ------------------------------------------------------
// Component: RecipesPage
// ------------------------------------------------------
//
// This is an **async Server Component** — meaning it runs on the server
// and can perform database queries directly (no client-side fetching needed).
//
// When a user visits `/recipes`, Next.js:
//   1. Runs this function on the server.
//   2. Fetches all recipes from the database.
//   3. Sends back fully rendered HTML containing all recipe data.
//
export default async function RecipesPage() {
  // ------------------------------------------------------
  // Fetch All Recipes from Database
  // ------------------------------------------------------
  //
  // Prisma query:
  // - Finds all recipes in the `recipe` table.
  // - Orders them from newest to oldest (`createdAt: "desc"`).
  // The result is a list of recipe objects with fields like
  // title, description, imageUrl, rating, etc.
  const recipes: RecipeWithAuthor[] = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    include: {author : true},
  });

  // ------------------------------------------------------
  // Render the Page UI
  // ------------------------------------------------------
  //
  // The page includes:
  // - Header ("All Recipes")
  // - A button linking to `/recipes/new` for adding recipes
  // - A conditional list: if there are no recipes, show a message;
  //   otherwise render a responsive grid of RecipeCards.
  return (
    <main className="space-y-6">
      <section>
        {/* Header + Add Recipe button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-3">All Recipes</h1>

          {/* Navigation link to the recipe creation form */}
          <Link
            href="/recipes/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Recipe
          </Link>
        </div>

        {/* Conditional rendering:
            - If there are no recipes, show a placeholder message.
            - Otherwise, display a grid of RecipeCard components. */}
        {recipes.length === 0 ? (
          <p className="text-sm text-gray-500">
            No recipes yet —{" "}
            <Link href="/recipes/new" className="underline">
              add one
            </Link>.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Render a <RecipeCard> for each recipe in the database */}
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
