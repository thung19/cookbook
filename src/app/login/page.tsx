// ======================================================
// src/app/login/page.tsx
// ======================================================
//
// 🔍 OVERVIEW
// This file defines the **Login Page** of your app (route: `/login`).
// It provides a simple form where users can log into their accounts
// using Supabase authentication.
//
// 🧩 How it fits into your stack:
//
// - Uses the Supabase client (`lib/supabase.ts`) to sign in users via email/password.
// - On successful login, Supabase automatically updates the session cookies.
// - The `AuthProvider` and `middleware.ts` handle the rest of the session tracking.
// - Once signed in, users are redirected to the homepage (`/`) or another route.
//
// This page is a **Client Component**, since it uses React hooks
// (`useState`, `useEffect`) and directly interacts with Supabase from the browser.
//

'use client';

import { useState } from 'react';                   // React hooks for state management
import { useRouter } from 'next/navigation';        // Next.js router for redirects
import { supabase } from '@/lib/supabase';          // Client-side Supabase instance

// ------------------------------------------------------
// Component: LoginPage
// ------------------------------------------------------
//
// Renders a login form that allows users to sign in with their email and password.
// On submit:
//   1. Calls Supabase’s `signInWithPassword` method.
//   2. Shows success or error messages.
//   3. Redirects the user after successful authentication.
//
export default function LoginPage() {
  // ------------------------------------------------------
  // State Variables
  // ------------------------------------------------------
  //
  // Store the user’s input and the loading state.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Used to navigate after login

  // ------------------------------------------------------
  // Function: handleLogin
  // ------------------------------------------------------
  //
  // Triggered when the user submits the login form.
  // It calls Supabase to verify the credentials.
  // If successful, the user is redirected to the home page (`/`).
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("handleLogin invoked", { emailPresent: !!email, passwordPresent: !!password }); //debug


    setError(null);
    setLoading(true);
      
    //debug
    console.log("supabase client (from import):", supabase);
    console.log("Calling signInWithPassword...");


    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    //debug
    console.log("signInWithPassword result", { data, error });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

  if (data?.session) {
    try {
      const resp = await fetch('/api/auth/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // allow cookies to be set
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });

      if (!resp.ok) {
        console.error('Failed to set server session cookie', await resp.text());
        // optionally set an error to show user
      } else {
        console.log('Server session cookie set');
      }
    } catch (err) {
      console.error('Error posting tokens to server:', err);
    }
}

    // Redirect to home page after login
    router.push('/');
    router.refresh(); // Refresh the route to update session-based UI
  };

  // ------------------------------------------------------
  // Render the Login Form
  // ------------------------------------------------------
  //
  // The form includes controlled input fields for email and password,
  // a login button, and simple error handling.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      {/* Error message display */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Login form */}
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Submit button */}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
