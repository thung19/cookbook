// ======================================================
// src/app/recipes/new/page.tsx
// ======================================================
//
// 🔍 OVERVIEW
// This file defines the `/recipes/new` route, which displays a **form**
// for users to create and submit a new recipe.
//
// 🧩 How it fits into your stack:
//
// - This is a **Client Component** because it uses React state (`useState`) 
//   and form events that run in the browser.
// - On submission, it sends a `POST` request to an API route (e.g., `/api/recipes`)
//   or directly uses Prisma to insert the recipe into your database.
// - After successful creation, it redirects the user back to the recipes page.
//
// The component demonstrates controlled inputs, async form handling, 
// and client-side navigation with Next.js.
//

'use client'  // Enables use of React hooks and browser-side interactivity.

import { useState } from 'react'             // React hook for managing local state.
import { useRouter } from 'next/navigation'  // Next.js hook for client-side redirects.
import { supabase } from '@/lib/supabase'    // Optional: to associate recipe with current user (if needed).

// ------------------------------------------------------
// COMPONENT: NewRecipePage
// ------------------------------------------------------
//
// Renders a form that allows users to input recipe details.
// Uses controlled components for each input field, which means
// the React state (`useState`) keeps track of their values in real time.
//
export default function NewRecipePage() {
  // ------------------------------------------------------
  // STATE VARIABLES
  // ------------------------------------------------------
  //
  // Each `useState` call creates a piece of local component state.
  // The first value is the current state; the second is the setter function.
  const [title, setTitle] = useState('')              // Recipe title input
  const [description, setDescription] = useState('')  // Short recipe summary
  const [cookTime, setCookTime] = useState('')        // Estimated cooking time
  const [error, setError] = useState<string | null>(null)  // Error message, if any
  const [loading, setLoading] = useState(false)       // Whether form is submitting

  const router = useRouter()  // Provides programmatic navigation (redirects, refreshes)

  // ------------------------------------------------------
  // FUNCTION: handleSubmit
  // ------------------------------------------------------
  //
  // Called when the user submits the form.
  // The parameter `(e)` is a SyntheticEvent (React’s wrapped version of a DOM event).
  // The `async` keyword allows use of `await` for asynchronous operations.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()  // Prevents the browser’s default page reload on form submit.
    setError(null)      // Reset error state before attempting submission.
    setLoading(true)    // Show loading state to disable button and prevent duplicates.

    try {
      // Optional: get current user from Supabase (if you associate author IDs)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // ------------------------------------------------------
      // SEND DATA TO YOUR API ROUTE OR DATABASE
      // ------------------------------------------------------
      //
      // Example: POST to a Next.js API route `/api/recipes`.
      // The `fetch` call sends JSON data to the server.
      const res = await fetch('/api/recipes', {
        method: 'POST',                 // HTTP verb indicating data creation.
        headers: { 'Content-Type': 'application/json' }, // Required header for JSON.
        body: JSON.stringify({
          title,
          description,
          cookTime,
          authorId: user?.id,           // Include user ID if available.
        }),
      })

      if (!res.ok) {
        // `.ok` is true for status codes in the 200–299 range.
        const msg = await res.text()
        throw new Error(msg || 'Failed to create recipe.')
      }

      // If successful, redirect to the recipes list.
      router.push('/recipes')
      router.refresh()  // Ensures UI updates with the new recipe immediately.

    } catch (err: any) {
      // Catch both network and application-level errors.
      setError(err
