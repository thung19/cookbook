import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // connects to Supabase via DATABASE_URL

// Handle GET requests (fetch all recipes)
export async function GET() {
  const recipes = await prisma.recipe.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(recipes); // sends back list of recipes
}

// Handle POST requests (add a new recipe)
export async function POST(req: Request) {
  const { title, description, imageUrl } = await req.json(); // reads data from form
  const recipe = await prisma.recipe.create({
    data: { title, description, imageUrl },
  });
  return NextResponse.json(recipe, { status: 201 }); // sends new recipe back
}
