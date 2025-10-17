import Link from "next/link";
import RecipeCard from "./components/RecipeCard/RecipeCard";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { Recipe, User } from "@prisma/client";

// Export the type so it can be used in other components
export type RecipeWithAuthor = Recipe & { author: User };

export default async function Home() {
  let recipes: RecipeWithAuthor[] = [];
  let user = null;
  let error = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
    
    recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true },
    });
  } catch (err) {
    console.error("Error loading recipes:", err);
    error = err;
  }

  if (error) {
    return (
      <main className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold mb-3">Latest Recipes</h1>
          <p className="text-red-500">Error loading recipes. Please try again later.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-3">Latest Recipes</h1>
          {user ? (
            <Link href="/recipes/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Add Recipe
            </Link>
          ) : (
            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Login to Add Recipe
            </Link>
          )}
        </div>
        {recipes.length === 0 ? (
          <p className="text-sm text-gray-500">
            No recipes yet — {user ? (
              <Link href="/recipes/new" className="underline">add one</Link>
            ) : (
              <Link href="/login" className="underline">login to add one</Link>
            )}.
          </p>
        ) : (
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