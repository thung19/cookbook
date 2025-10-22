// ======================================================
// src/app/signup/page.tsx
// ======================================================
//
// 🔍 OVERVIEW
// This page renders the **Sign Up** screen for new user registration.
// It supports:
//   1) OAuth providers (Google, Apple) via Supabase
//   2) Email + password signup with basic client-side validation
//
// 🧩 How it fits into your stack:
// - Uses the **client-side** Supabase SDK (`lib/supabase.ts`) to create accounts.
// - Redirects new users to `/auth/welcome` after OAuth or email confirmation.
// - On success, navigates user to `/login` (for email flow) to sign in after confirming.
//
// Marked `'use client'` because it uses React hooks (`useState`) and browser APIs.
//

// app/signup/page.tsx
// Dedicated signup page for new user registration
'use client' // Needed because this file uses hooks and runs in the browser.

import { useState } from 'react'      // React hook for component-local state.
import Link from 'next/link'          // Client-side navigation (no full page reload).
import { supabase } from "@/lib/supabase" // Browser Supabase client (public anon key).
import { useRouter } from "next/navigation" // App Router's hook for programmatic navigation.

export default function SignupPage() {
  // ------------------------------------------------------
  // HOOKS
  // ------------------------------------------------------
  const router = useRouter()

  // `useState` returns a pair: [value, setter]. It re-renders on set.
  // formData groups email/password fields in a single state object.
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' })

  // Parallel errors object — one error string per field.
  const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '' })

  // Toggles password input visibility (plain text vs dots).
  const [showPassword, setShowPassword] = useState(false)

  // Tracks loading state for disabling buttons and showing spinners.
  const [isLoading, setIsLoading] = useState(false)

  // ------------------------------------------------------
  // FUNCTION: handleProviderAuth
  // ------------------------------------------------------
  //
  // Starts OAuth flow with a given provider. Supabase will:
  //  - Redirect user to the provider (Google/Apple).
  //  - After consent, redirect back to `redirectTo`.
  //
  // Type `'google' | 'apple'` narrows allowed string values at compile time (TypeScript).
  const handleProviderAuth = async (provider: 'google' | 'apple') => {
    setIsLoading(true)

    // `signInWithOAuth` opens the provider’s auth page.
    // redirectTo: where the provider should send the user back to.
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/welcome` },
    })

    if (error) {
      // `alert` is simple feedback; in production you might use a toast.
      alert(error.message)
      setIsLoading(false)
    }
  }

  // ------------------------------------------------------
  // FUNCTION: handleEmailSubmit
  // ------------------------------------------------------
  //
  // Handles the email/password signup flow:
  //  1) Prevent default form submission
  //  2) Basic validation
  //  3) Call `supabase.auth.signUp`
  //  4) Advise user to confirm email, then route to /login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent browser reload.
    
    // Create a fresh error object (no errors initially).
    const newErrors = { email: '', password: '', confirmPassword: '' }
    
    // ------------------ BASIC VALIDATION ------------------
    // Email presence + very basic format check.
    if (!formData.email) {
      newErrors.email = 'Email is required.'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address.'
    }
    
    // Password presence + length requirement.
    if (!formData.password) {
      newErrors.password = 'Password is required.'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.'
    }

    // Confirm password presence + match.
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    // Update UI with any validation errors (triggers re-render).
    setErrors(newErrors)
    
    // If no field has an error string (all falsy), proceed.
    if (!newErrors.email && !newErrors.password && !newErrors.confirmPassword) {
      setIsLoading(true)

      // `signUp` creates a new user. Supabase will send a confirmation email.
      // `emailRedirectTo`: where to send user after they click the email confirmation link.
      const { error } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/welcome`
        }
      })
      
      if (error) {
        alert(error.message)
        setIsLoading(false)
        return
      }
      
      // At this point, account is created but unconfirmed.
      // Prompt user to check their inbox, then route them to login.
      alert("Check your email for confirmation link!")
      router.push("/login")
    }
  }

  // `isValid` is a quick guard to enable/disable the submit button.
  // Truthy only if all fields have some value (not validation correctness).
  const isValid = formData.email && formData.password && formData.confirmPassword

  // ------------------------------------------------------
  // JSX OUTPUT
  // ------------------------------------------------------
  //
  // TailwindCSS utility classes are used for layout & styles.
  // `className` is React’s version of `class`.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-gray-600">Join CookBook to share and discover recipes.</p>
        </div>

        {/* Auth form container */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-4">
            {/* Provider buttons */}
            <div className="space-y-3">
              {/* GOOGLE OAUTH */}
              <button
                onClick={() => handleProviderAuth('google')} // Pass literal 'google' (narrowed union type).
                disabled={isLoading} // Prevent double-clicks while loading.
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed md:max-w-xs md:mx-auto"
              >
                {/* Simple SVG Google logo (brand-colored paths) */}
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* APPLE OAUTH */}
              <button
                onClick={() => handleProviderAuth('apple')}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed md:max-w-xs md:mx-auto"
              >
                {/* Apple logo (monochrome) */}
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continue with Apple
              </button>
            </div>

            {/* Divider with "or continue with email" */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or continue with email</span>
              </div>
            </div>

            {/* EMAIL SIGNUP FORM */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"                 // HTML5 validation and keyboard on mobile.
                    autoComplete="email"
                    value={formData.email}       // Controlled input (state → input).
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} // Update state immutably.
                    className={`block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    aria-describedby={errors.email ? 'email-error' : undefined} // A11y: ties error text to input.
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Password field with show/hide toggle */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'} // Toggle visibility
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`block w-full rounded-lg border px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                    placeholder="Create a password"
                  />
                  {/* Eye icon button (type="button" avoids form submit) */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      // "Eye off" icon
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      // "Eye" icon
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Inline error or helper text */}
                {errors.password && (
                  <p id="password-error" role="alert" className="mt-1 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
                
                {!errors.password && (
                  <p id="password-hint" className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                )}
              </div>

              {/* Confirm Password field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p id="confirm-password-error" role="alert" className="mt-1 text-xs text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit (Email Signup) */}
              <button
                type="submit"
                disabled={!isValid || isLoading} // Disabled if fields empty or submitting.
                className="w-full rounded-lg bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 md:max-w-xs md:mx-auto"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    {/* Small loading spinner */}
                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>

              {/* Legal text */}
              <p className="text-xs text-gray-500 text-center">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-gray-700">
                  Terms
                </Link>{' '}
                and acknowledge our{' '}
                <Link href="/privacy" className="underline hover:text-gray-700">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>

            {/* Footer links */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <Link href="/reset-password" className="hover:text-gray-700">
                Forgot password?
              </Link>
              {/* Placeholder for magic link flow (could call supabase.auth.signInWithOtp) */}
              <button className="hover:text-gray-700">Use magic link</button>
            </div>
          </div>
          
          {/* Switch to login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
