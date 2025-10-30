import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata = {
  title: 'Profile',
};

export default async function ProfilePage() {
  // Get current user
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's recipes
  const recipes = await prisma.recipe.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Get user profile from database
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
  });

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-6">
          {/* Avatar placeholder */}
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {user.email?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.username || 'User'}
            </h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 mt-2">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
            <p className="text-sm text-gray-600">Recipes</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">
              {recipes.reduce((sum, r) => sum + r.views, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Views</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">
              {recipes.length > 0
                ? (
                    recipes.reduce((sum, r) => sum + r.rating, 0) /
                    recipes.length
                  ).toFixed(1)
                : '0.0'}
            </p>
            <p className="text-sm text-gray-600">Avg Rating</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/profile/edit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Profile
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </form>
        </div>
      </section>

      {/* User's Recipes */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Recipes</h2>
          <Link
            href="/recipes/new"
            className="text-blue-600 hover:text-blue-700"
          >
            Add New Recipe
          </Link>
        </div>

        {recipes.length === 0 ? (
          <p className="text-gray-500">
            You haven't created any recipes yet.{' '}
            <Link href="/recipes/new" className="underline">
              Create one now
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {recipe.imageUrl && (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{recipe.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="mt-3 flex justify-between text-sm text-gray-500">
                    <span>{recipe.views} views</span>
                    <span>⭐ {recipe.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}