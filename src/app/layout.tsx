// ======================================================
// src/app/layout.tsx
// ======================================================
//
// 🔍 OVERVIEW
// This file defines the **Root Layout** for your entire Next.js App Router project.
//
// In Next.js 13+ (with the `/app` directory), `layout.tsx` files define the
// structure that wraps around all pages within their folder scope.
//
// This root layout applies to the *entire app* — meaning every route inside `/app`
// (e.g., `/`, `/recipes`, `/explore`, etc.) will be rendered inside this layout’s
// <body> section.
//
// 🧩 How it fits into your stack:
//
// - Provides global HTML structure (<html>, <body>).
// - Renders the navigation bar (`Nav` component) on every page.
// - Imports `globals.css`, which applies global Tailwind and base styles.
// - Exports site-wide metadata (title + description) for SEO.
// - Wraps all child pages in a shared layout to keep design consistent.
//
// Together, this file defines the "frame" of your entire Cooking Web App.
//

import "./globals.css";                    // Global stylesheet (Tailwind + custom base styles)
import Nav from "./components/Nav/Nav";    // Global navigation bar component
import type { ReactNode } from "react";    // TypeScript type for any valid React children

// ------------------------------------------------------
// Navigation Links
// ------------------------------------------------------
//
// Define the main navigation items displayed in the navbar.
// Each link has a `href` (target path) and a `label` (text displayed in the Nav component).
const links = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
  { href: "/recipes/new", label: "Add Recipe" }
 
];

// ------------------------------------------------------
// Metadata Configuration
// ------------------------------------------------------
//
// Next.js automatically injects this metadata into the <head> of every page.
// This is used for browser tab titles, SEO, and link previews.
export const metadata = {
  title: "Cooking Web App",
  description: "A recipe sharing platform",
};

// ------------------------------------------------------
// RootLayout Component
// ------------------------------------------------------
//
// The RootLayout wraps around every route in your app.
// It defines the top-level HTML structure (<html> and <body>)
// and ensures the navigation bar and global styles appear everywhere.
//
// The `children` prop represents the content of the current route
// (e.g., `/` → Home page, `/recipes` → Recipes list, etc.).
export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    // Root HTML element; sets the language for accessibility and SEO
    <html lang="en">
      <body>
        {/* Global navigation bar visible on every page */}
        <Nav links={links} />

        {/* Page content — each route is injected here */}
        {children}
      </body>
    </html>
  );
}
