// ======================================================
// src/app/components/RecipeCard/RecipeCard.tsx
// ======================================================
//
// 🔍 OVERVIEW
// This component renders an individual **Recipe Card** —
// a compact visual representation of a recipe that includes:
//
// - Image preview (if available)
// - Recipe title
// - Author username
// - Description (short preview)
// - Rating (as filled/unfilled stars)
// - Metadata (views and cook time)
//
// It’s a **presentational component** — meaning it only displays data
// and doesn’t perform any data fetching or business logic.
//
// 🧩 How it fits into your stack:
//
// - Used inside the homepage (`page.tsx`) and other list views
//   to render each recipe in a grid.
// - Receives recipe data (with author info) as props from the parent.
// - Uses a local CSS Module (`RecipeCard.module.css`) for scoped styling.
//

import styles from "./RecipeCard.module.css";     // Scoped CSS module for styling (avoids global style conflicts)
import type { Recipe, User } from "@prisma/client"; // Import Prisma-generated types for type safety

// ------------------------------------------------------
// Type Definition
// ------------------------------------------------------
//
// Define a composite type that merges the `Recipe` model
// with its associated `User` model (author).
// This matches the data shape retrieved by Prisma's `include: { author: true }` query.
type RecipeWithAuthor = Recipe & { author: User };

// ------------------------------------------------------
// Helper Function: renderStars
// ------------------------------------------------------
//
// Dynamically renders a 5-star rating system based on the recipe’s numeric rating.
// Filled stars (★) indicate the rating value, and empty ones indicate the remainder.
//
const renderStars = (rating: number) => {
  const stars = [];

  // Loop from 1 to 5 and add a filled or empty star depending on rating value
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i} // React key for list rendering
        className={`${styles.star} ${
          i <= Math.round(rating) ? styles.filled : "" // Apply "filled" style if the star is within the rating range
        }`}
      >
        ★
      </span>
    );
  }

  return stars;
};

// ------------------------------------------------------
// Component: RecipeCard
// ------------------------------------------------------
//
// Accepts a single prop: `recipe`, which contains all the
// data needed to display this recipe’s card (title, author, rating, etc.).
//
const RecipeCard = ({ recipe }: { recipe: RecipeWithAuthor }) => {
  return (
    // Each card is rendered as a <li> for semantic structure in a grid/list.
    <li className={styles.card}>
      {/* Display the recipe image (if available) */}
      {recipe.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className={styles.image}
        />
      )}

      {/* Recipe title */}
      <h3 className={styles.title}>{recipe.title}</h3>

      {/* Display author username under the title */}
      <p className="text-sm text-gray-500 mb-2">
        by {recipe.author.username}
      </p>

      {/* Optional description (short preview of the recipe) */}
      {recipe.description && (
        <p className={styles.description}>{recipe.description}</p>
      )}

      {/* Rating section: shows stars and numeric rating */}
      <div className={styles.stars}>
        {renderStars(recipe.rating)} {/* Renders filled/unfilled stars */}
        <span>({recipe.rating.toFixed(1)})</span> {/* Display numeric rating */}
      </div>

      {/* Metadata row: views and cook time */}
      <div className={styles.meta}>
        <span>👁 {recipe.views} views</span>
        <span>⏱ {recipe.cookTime ?? "—"}</span> {/* Display cook time or dash if null */}
      </div>
    </li>
  );
};

export default RecipeCard;
