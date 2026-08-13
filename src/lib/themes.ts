import { theme } from '$lib/stores/theme';

/**
 * Side-effect module: mirrors the theme store onto <html>. Imported once from
 * the public layout. `color-scheme` is kept in sync too so form controls,
 * scrollbars and the browser's own chrome match the palette.
 */
theme.subscribe((mode) => {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	root.classList.toggle('dark', mode === 'dark');
	root.classList.toggle('light', mode === 'light');
	root.style.colorScheme = mode;
});

export { theme };
