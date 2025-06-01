// src/hooks.server.ts
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name) {
        return event.cookies.get(name);
      },
      set(name, value, options) {
        event.cookies.set(name, value, options);
      },
      remove(name, options) {
        event.cookies.delete(name, options);
      }
    }
  });

  event.locals.supabase = supabase;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  event.locals.session = session;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  event.locals.user = user;

  // Optional redirect logic
  if (!session && event.url.pathname.startsWith('/admin')) {
    console.log('Current session if no session:', event.locals.session);
    throw redirect(303, '/auth');
  }

  if (session && event.url.pathname === '/auth') {
    console.log('Current session is available:', event.locals.session);
    throw redirect(303, '/admin');
  }

  return resolve(event);
};
