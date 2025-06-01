// src/routes/+layout.ts
import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, depends }) => {
  depends('supabase:auth');

  const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: { fetch }
  });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return {
    supabase,
    session
  };
};
