import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * The inline script in `src/app.html` has already resolved the theme and
 * stamped it on <html> before this module runs, so the DOM — not
 * `prefers-color-scheme` — is the source of truth for the initial value.
 * Reading it back here keeps the store in sync with what is actually painted.
 */
function initialTheme(): Theme {
	// Night is the default (see app.html); only an explicit `.light` flips it.
	if (typeof document === 'undefined') return 'dark';
	return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

export const theme = writable<Theme>(initialTheme());

export function setTheme(mode: Theme) {
	theme.set(mode);
	try {
		localStorage.setItem(STORAGE_KEY, mode);
	} catch {
		/* private mode / storage disabled — the in-memory store still works */
	}
}

export function toggleTheme() {
	theme.update((mode) => {
		const next: Theme = mode === 'dark' ? 'light' : 'dark';
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			/* ignore */
		}
		return next;
	});
}
