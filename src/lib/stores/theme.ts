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
	if (typeof document === 'undefined') return 'light';
	return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
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

/**
 * Follow the OS preference, but only while the visitor has not made an
 * explicit choice. Once they use the toggle, their pick sticks.
 */
if (typeof window !== 'undefined' && window.matchMedia) {
	const query = window.matchMedia('(prefers-color-scheme: dark)');
	query.addEventListener('change', (event) => {
		let stored: string | null = null;
		try {
			stored = localStorage.getItem(STORAGE_KEY);
		} catch {
			/* ignore */
		}
		if (stored !== 'light' && stored !== 'dark') {
			theme.set(event.matches ? 'dark' : 'light');
		}
	});
}
