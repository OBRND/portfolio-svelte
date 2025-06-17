import { theme } from '$lib/stores/theme';

theme.subscribe((mode) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    document.documentElement.classList.toggle('light', mode === 'light');
  }
});
