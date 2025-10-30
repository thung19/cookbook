'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client used by client components.
 * Uses NEXT_PUBLIC_* env vars automatically.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);