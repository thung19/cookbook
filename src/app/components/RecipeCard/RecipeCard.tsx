import styles from "./RecipeCard.module.css";
import type { Recipe, User } from "@prisma/client";

type RecipeWithAuthor = Recipe & { author: User };

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`${styles.star} ${i <= Math.round(rating) ? styles.filled : ""}`}
      >
        ★
      </span>
    );
  }
  return stars;
};

const RecipeCard = ({ recipe }: { recipe: RecipeWithAuthor }) => {
  return (
    <li className={styles.card}>
      {recipe.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={recipe.imageUrl} alt={recipe.title} className={styles.image} />
      )}

      <h3 className={styles.title}>{recipe.title}</h3>
      <p className="text-sm text-gray-500 mb-2">by {recipe.author.username}</p>

      {recipe.description && <p className={styles.description}>{recipe.description}</p>}

      <div className={styles.stars}>
        {renderStars(recipe.rating)}
        <span>({recipe.rating.toFixed(1)})</span>
      </div>

      <div className={styles.meta}>
        <span>👁 {recipe.views} views</span>
        <span>⏱ {recipe.cookTime ?? "—"}</span>
      </div>
    </li>
  );
};

export default RecipeCard;