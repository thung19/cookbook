// ======================================================
// src/app/explore/page.tsx
// ======================================================
//
// 🔍 OVERVIEW
// This file defines the **Explore Page** of your app (route: `/explore`).
// It’s a **Server Component** that fetches user data from an external API
// (`https://jsonplaceholder.typicode.com/users`) and displays it as a list.
//
// 🧩 How it fits into your stack:
//
// - Unlike your recipe pages (which fetch data from your own Supabase database),
//   this page demonstrates fetching data from an *external public API*.
// - It uses Next.js's built-in server-side data fetching (`fetch`).
// - The `{ cache: 'no-store' }` option ensures that the data is **not cached**,
//   so the page always shows up-to-date content on every request.
//

import React from 'react' // Import React to use JSX syntax (required in Next.js)
 
// ------------------------------------------------------
// Type Definition
// ------------------------------------------------------
//
// Define the shape of a user object returned by the API.
// This gives you full TypeScript type safety when working with the response.
interface User {
  id: number;   // unique identifier for the user
  name: string; // user's name
}

// ------------------------------------------------------
// Component: UsersPage
// ------------------------------------------------------
//
// This is an **async Server Component** — it runs entirely on the server.
// You can use `await` directly in the component to fetch data before rendering.
//
// When a client visits `/explore`, the server will:
//   1. Fetch the list of users from the API
//   2. Wait for the data to resolve (`await res.json()`)
//   3. Render the page HTML containing that data
//
const UsersPage = async () => {
  // ------------------------------------------------------
  // Fetch Data from External API
  // ------------------------------------------------------
  //
  // Next.js's `fetch` runs on the server by default.
  // The `cache: 'no-store'` option means:
  //   - Always fetch fresh data (don’t cache the response between requests).
  //   - Useful for dynamic data that changes frequently.
  const res = await fetch(
    'https://jsonplaceholder.typicode.com/users',
    { cache: 'no-store' }
  );

  // Convert the HTTP response to JSON format
  // and cast it as an array of `User` objects.
  const users: User[] = await res.json();

  // ------------------------------------------------------
  // Render the Page UI
  // ------------------------------------------------------
  //
  // Display a simple list of users and the current server-rendered time.
  // `new Date().toLocaleTimeString()` shows when the page was rendered.
  // This helps demonstrate that the data is fetched fresh on each request.
  return (
    <div>
      <h1>Users</h1>

      {/* Show current time when the page was rendered (server-side) */}
      <p>{new Date().toLocaleTimeString()}</p>

      {/* Render a list of user names */}
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
