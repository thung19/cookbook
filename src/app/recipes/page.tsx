import Link from "next/link";
import RecipeCard from "../components/RecipeCard/RecipeCard";
import { prisma } from "@/lib/prisma";
import type { Recipe } from "@prisma/client";

export const metadata = {
  title: "All Recipes",
};

export default async function RecipesPage() {
  const recipes: Recipe[] = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="space-y-6">
      <section>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-3">All Recipes</h1>
          <Link href="/recipes/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Recipe
          </Link>
        </div>
        {recipes.length === 0 ? (
          <p className="text-sm text-gray-500">
            No recipes yet — <Link href="/recipes/new" className="underline">add one</Link>.
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