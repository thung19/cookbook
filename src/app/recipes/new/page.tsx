import "./addRecipe.css";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const metadata = {
  title: "Add Recipe",
};

async function createRecipe(formData: FormData) {
  "use server";
  
  // Get current user
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
    return;
  }

  const title = (formData.get("title") as string)?.trim() || "";
  const description = (formData.get("description") as string)?.trim() || "";
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || "";
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || "";

  if (!title) {
    throw new Error("Title is required.");
  }

  // Include authorId when creating recipe
  await prisma.recipe.create({
    data: {
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      authorId: user.id, // Add this required field
    },
  });

  redirect("/recipes");
}

export default function AddRecipePage() {
  return (
    <div className="form-container">
      <h1 className="form-title">Add New Recipe</h1>
      <form action={createRecipe}>
        <div className="form-field">
          <label htmlFor="title" className="label">
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="input"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="textarea"
            rows={4}
          />
        </div>

        <div className="form-field">
          <label htmlFor="imageUrl" className="label">
            Image URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            className="input"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-field">
          <label htmlFor="videoUrl" className="label">
            Video URL
          </label>
          <input
            id="videoUrl"
            name="videoUrl"
            type="url"
            className="input"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <button type="submit" className="submit-button">
          Add Recipe
        </button>
      </form>
    </div>
  );
}