import { writable } from 'svelte/store';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light'; // fallback for SSR
}

export const theme = writable<'light' | 'dark'>(getSystemTheme());
