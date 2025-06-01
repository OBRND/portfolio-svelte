// src/routes/admin/+page.server.ts
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  // If no session, redirect to auth
  if (!locals.session) {
    throw redirect(303, '/auth');
  }

  // If session exists, redirect to /admin/projects
  throw redirect(303, '/admin/projects');
};
