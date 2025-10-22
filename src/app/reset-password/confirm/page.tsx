// ======================================================
// src/app/reset-password/confirm/page.tsx
// ======================================================
//
// 🔍 OVERVIEW
// This page is the second step of the Supabase password reset flow.
// After clicking the email link, Supabase appends `access_token` and
// `refresh_token` to the URL hash (#...).
//
// This component:
//   - Validates that the Supabase session is active (from link tokens)
//   - Lets the user set a new password
//   - Calls `supabase.auth.updateUser()` to update the password
//   - Redirects the user to `/login` after success
//
// 🧩 It’s a **Client Component** because it uses hooks (`useState`, `useEffect`)
// and interacts with `window.location`.
//
// ------------------------------------------------------

'use client' // Required because React hooks and browser APIs only run client-side.

import { useState, useEffect } from 'react' // React hooks for managing component state and side effects.
import { useRouter, useSearchParams } from 'next/navigation' 
// `useRouter` → navigate programmatically (redirects)
// `useSearchParams` → access query string params (optional, used for debugging or token handling)
import { supabase } from "@/lib/supabase" // Your configured Supabase client for frontend usage.
import Link from 'next/link'               // Next.js link component for smooth client-side navigation.

// ------------------------------------------------------
// COMPONENT: ResetPasswordConfirmPage
// ------------------------------------------------------
//
// This component handles verifying the Supabase session and updating the user’s password.
//
export default function ResetPasswordConfirmPage() {
  // ------------------------------------------------------
  // ROUTER AND SEARCH PARAMS
  // ------------------------------------------------------
  const router = useRouter()              // Gives access to push(), refresh(), etc.
  const searchParams = useSearchParams()  // Can read query params (not used heavily here)

  // ------------------------------------------------------
  // STATE VARIABLES
  // ------------------------------------------------------
  //
  // These `useState` hooks manage local UI and form state.
  const [password, setPassword] = useState('')             // Stores new password input
  const [confirmPassword, setConfirmPassword] = useState('') // Stores confirmation field
  const [isLoading, setIsLoading] = useState(false)         // Tracks loading spinner state
  const [error, setError] = useState('')                    // Displays error messages to user
  const [showPassword, setShowPassword] = useState(false)   // Toggles password visibility
  const [isValidSession, setIsValidSession] = useState(false) // Whether the reset link is valid

  // ------------------------------------------------------
  // EFFECT: Validate Supabase Session
  // ------------------------------------------------------
  //
  // When the page loads, Supabase must confirm that the URL’s
  // token corresponds to a valid session.
  //
  // Supabase automatically includes `access_token` and `refresh_token`
  // in the URL hash (#...), which must be read manually in browser.
  useEffect(() => {
    const checkSession = async () => {
      // 1️⃣ Try to get existing session (in case user already logged in)
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setIsValidSession(true) // Session found → allow password update
      } else {
        // 2️⃣ Otherwise, parse the URL hash for tokens sent by Supabase
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        // If both tokens exist, set the Supabase session manually
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          // If successful, mark the session as valid
          if (data.session && !error) {
            setIsValidSession(true)
          }
        }
      }
    }

    checkSession() // Run the check immediately when the page mounts
  }, []) // Empty dependency array → runs only once on mount

  // ------------------------------------------------------
  // FUNCTION: handleSubmit
  // ------------------------------------------------------
  //
  // Called when user submits the "Set new password" form.
  // Performs validation before calling Supabase API.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()     // Prevent default page reload on submit.
    setIsLoading(true)
    setError('')           // Reset error message for fresh attempt.

    // ------------------------------------------------------
    // CLIENT-SIDE VALIDATION
    // ------------------------------------------------------
    if (!password) {
      setError('Password is required')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // ------------------------------------------------------
    // SUPABASE PASSWORD UPDATE
    // ------------------------------------------------------
    //
    // `supabase.auth.updateUser()` uses the current session token to
    // update user info, including password.
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    // ------------------------------------------------------
    // SUCCESS → REDIRECT
    // ------------------------------------------------------
    //
    // After password update, navigate user back to login page
    // and optionally show a success message (?message=password-updated).
    router.push('/login?message=password-updated')
  }

  // ------------------------------------------------------
  // CONDITIONAL RENDER: INVALID OR EXPIRED LINK
  // ------------------------------------------------------
  //
  // If Supabase tokens are missing or invalid, show an error UI instead of the form.
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            {/* ❌ Red "X" icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            {/* Message */}
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Invalid or expired link</h1>
            <p className="mt-2 text-gray-600">
              This password reset link is invalid or has expired.
            </p>

            {/* Link back to reset request form */}
            <div className="mt-6">
              <Link
                href="/reset-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Request a new reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------
  // MAIN RENDER: PASSWORD UPDATE FORM
  // ------------------------------------------------------
  //
  // If session is valid, render the form to set a new password.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* -------------------- HEADER -------------------- */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Set new password</h1>
          <p className="mt-2 text-gray-600">
            Enter your new password below.
          </p>
        </div>

        {/* -------------------- FORM -------------------- */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NEW PASSWORD INPUT */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>

              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'} // Toggle between visible/hidden password
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Update React state on keystroke
                  className={`block w-full rounded-lg border px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password"
                />

                {/* Toggle visibility button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Flip visibility boolean
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {/* Conditional icon rendering */}
                  {showPassword ? (
                    // "Eye off" icon
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                          a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243
                          M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    // "Eye" icon
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5
                          c4.478 0 8.268 2.943 9.542 7
                          -1.274 4.057-5.064 7-9.542 7
                          -4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Helper text below input */}
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            {/* CONFIRM PASSWORD INPUT */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {/* Show validation error message */}
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={!password || !confirmPassword || isLoading} // Disable if incomplete or loading
              className="w-full rounded-lg bg-blue-600 py-3 px-4 text-sm font-medium text-white
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* Conditional rendering for loading spinner */}
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
                             5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824
                             3 7.938l3-2.647z" />
                  </svg>
                  Updating password...
                </div>
              ) : (
                'Update password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
