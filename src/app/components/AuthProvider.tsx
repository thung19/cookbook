// ======================================================
// src/app/components/AuthProvider.tsx
// ======================================================
//
// 🔍 OVERVIEW
// This component creates and provides a global **authentication context**
// for your entire application using Supabase's authentication system.
//
// It allows any component in your app to easily access:
//   - The currently signed-in user (`user`)
//   - Whether the authentication state is still loading (`loading`)
//
// 🧩 How it fits into your stack:
//
// - Supabase handles user authentication (login, signup, logout).
// - This provider listens for auth state changes (session start/end).
// - It stores the `user` object in React state and exposes it via context.
// - Components can access it using the `useAuth()` hook.
//
// This file is marked `'use client'` because it uses React hooks
// (`useState`, `useEffect`, `useContext`), which only run on the client side.
//

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'              // Supabase client (browser version)
import type { User } from '@supabase/supabase-js'      // Supabase's built-in User type

// ------------------------------------------------------
// Context Type Definition
// ------------------------------------------------------
//
// Defines the structure of the authentication context that will be shared
// across the app. It includes:
//   - `user`: the Supabase user object or null if logged out
//   - `loading`: a boolean indicating if auth data is still being fetched
interface AuthContextType {
  user: User | null
  loading: boolean
}

// ------------------------------------------------------
// Create Authentication Context
// ------------------------------------------------------
//
// Initialize the context with default values (no user, still loading).
// Components wrapped by this context will later receive real user data.
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

// ------------------------------------------------------
// Custom Hook: useAuth
// ------------------------------------------------------
//
// Provides a simple way for components to access the auth context.
//
// Usage example:
//   const { user, loading } = useAuth()
//
// If used outside the AuthProvider, it throws an error
// to prevent invalid usage.
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ------------------------------------------------------
// Component: AuthProvider
// ------------------------------------------------------
//
// Wraps the entire application (in `layout.tsx` or `_app.tsx`) and
// provides authentication state to all children components.
//
// - Tracks the current user and loading state
// - Fetches the initial Supabase session on mount
// - Subscribes to auth state changes (login/logout)
// - Automatically updates the context when session changes
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // React state for user and loading
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ------------------------------------------------------
    // 1️⃣ Fetch Initial Session
    // ------------------------------------------------------
    //
    // When the app first loads, check if there’s an existing
    // logged-in user session (persisted via Supabase cookies/localStorage).
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // If a session exists, set the user; otherwise null
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // ------------------------------------------------------
    // 2️⃣ Subscribe to Auth State Changes
    // ------------------------------------------------------
    //
    // Supabase emits an event whenever authentication state changes:
    //  - "SIGNED_IN" when a user logs in
    //  - "SIGNED_OUT" when a user logs out
    //  - "TOKEN_REFRESHED" when a session refreshes
    //
    // This listener automatically updates the React state
    // whenever those events occur.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // ------------------------------------------------------
    // 3️⃣ Cleanup Subscription on Unmount
    // ------------------------------------------------------
    //
    // Prevents memory leaks when the component is removed.
    return () => subscription.unsubscribe()
  }, [])

  // ------------------------------------------------------
  // Provide Context to All Child Components
  // ------------------------------------------------------
  //
  // All components nested inside this provider can now access
  // `{ user, loading }` using the `useAuth()` hook.
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
