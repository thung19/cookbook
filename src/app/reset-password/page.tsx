// ======================================================
// src/app/reset-password/page.tsx
// ======================================================
//
// 🔍 OVERVIEW
// This file defines the `/reset-password` route, which displays a form
// allowing users to enter their email and request a password reset link.
//
// 🧩 How it fits into your stack:
//
// - Uses Supabase’s `auth.resetPasswordForEmail()` method to send
//   a secure password reset link to the user’s email.
// - Uses React’s `useState` hook to manage form state (input, loading, error).
// - Renders two UIs:
//    1️⃣ The email input form (before submission)
//    2️⃣ A confirmation message (after the link is sent)
//
// This is a **Client Component** (marked `'use client'`) since it uses
// browser APIs (window.location) and React hooks.
//

'use client' // Required because we’re using hooks like useState (client-only feature).

import { useState } from 'react'        // React hook for managing component state.
import Link from 'next/link'            // Next.js component for client-side navigation.
import { supabase } from "@/lib/supabase" // Supabase client configured for frontend access.

// ------------------------------------------------------
// COMPONENT: ResetPasswordPage
// ------------------------------------------------------
//
// This component renders the password reset form and handles user interactions.
//
export default function ResetPasswordPage() {
  // ------------------------------------------------------
  // STATE VARIABLES
  // ------------------------------------------------------
  //
  // Each `useState` call declares a piece of local state:
  //   - `email`: stores user input from the email field.
  //   - `isSubmitted`: tracks whether the reset request succeeded.
  //   - `isLoading`: tracks whether the request is currently sending.
  //   - `error`: holds an error message (if any occurs).
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // ------------------------------------------------------
  // FUNCTION: handleSubmit
  // ------------------------------------------------------
  //
  // Triggered when the form is submitted.
  // Uses `async/await` for asynchronous Supabase operations.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()       // Prevents the browser from reloading the page.
    setIsLoading(true)       // Start the loading spinner.
    setError('')             // Clear any previous error message.

    // ✅ Validate email before sending.
    if (!email) {
      setError('Email is required')
      setIsLoading(false)
      return
    }

    // ------------------------------------------------------
    // SUPABASE PASSWORD RESET
    // ------------------------------------------------------
    //
    // Supabase sends a password reset email to the given address.
    // The `redirectTo` option defines where the user is sent *after*
    // clicking the reset link (in this case `/reset-password/confirm`).
    //
    // Destructure `error` as `resetError` to avoid name collision.
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password/confirm`, 
      // `window.location.origin` dynamically gets the base URL (works for dev & prod).
    })
    
    // If Supabase returns an error, show it in the UI.
    if (resetError) {
      setError(resetError.message)
      setIsLoading(false)
      return
    }
    
    // ✅ Success — show confirmation message.
    setIsSubmitted(true)
    setIsLoading(false)
  }

  // ------------------------------------------------------
  // CONDITIONAL RENDERING: SUCCESS MESSAGE
  // ------------------------------------------------------
  //
  // If the reset link has been successfully sent,
  // show a confirmation screen instead of the form.
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            {/* Green success checkmark icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Header text */}
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Check your email</h1>
            <p className="mt-2 text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Check your spam folder if you don't see the email in your inbox.
            </p>

            {/* Navigation link back to login */}
            <div className="mt-6">
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------
  // DEFAULT RENDER: PASSWORD RESET FORM
  // ------------------------------------------------------
  //
  // If the user hasn’t submitted the form yet, show the email input UI.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* --------------------------- HEADER --------------------------- */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* --------------------------- FORM --------------------------- */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* The `onSubmit` event triggers handleSubmit() when user presses Enter or clicks button */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              {/* Label for accessibility */}
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>

              {/* Email input field */}
              <div className="mt-1">
                <input
                  id="email"                        // Associates with <label htmlFor="email">
                  type="email"                      // Enforces email validation in HTML5
                  autoComplete="email"              // Enables browser autofill
                  required                          // Makes field mandatory before submission
                  value={email}                     // Controlled input (bound to React state)
                  onChange={(e) => setEmail(e.target.value)} // Update state when typing
                  className={`block w-full rounded-lg border px-3 py-2 shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-300' : 'border-gray-300' // Conditional border color on error
                  }`}
                  placeholder="Enter your email"
                />

                {/* Display error message if present */}
                {error && (
                  <p className="mt-1 text-xs text-red-600">{error}</p>
                )}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"                        // Makes button trigger form submission
              disabled={!email || isLoading}       // Disabled if email is empty or currently loading
              className="w-full rounded-lg bg-blue-600 py-3 px-4 text-sm font-medium text-white 
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* Conditional rendering: show spinner when loading */}
              {isLoading ? (
                <div className="flex items-center justify-center">
                  {/* Small spinner SVG animation */}
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" 
                            stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" 
                          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                             5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 
                             3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </div>
              ) : (
                'Send reset link'  // Default button text
              )}
            </button>
          </form>

          {/* --------------------------- FOOTER --------------------------- */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
