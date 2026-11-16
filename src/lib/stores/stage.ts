import { writable } from 'svelte/store';

/**
 * Flips to `true` once the intro curtain has lifted. The hero waits on this to
 * play its entrance, so the type never animates in behind the curtain where
 * nobody can see it.
 */
export const ready = writable(false);

/**
 * How the atmosphere behind the page is lit. Each section declares the mood it
 * wants with a `data-mood` attribute; the layout watches which one is on
 * screen and the shader eases its lights toward it.
 *
 * `cool` is the azure light (Flutter), `warm` the ember one (SvelteKit),
 * `energy` how much the two bleed into each other. `still` stops the shader
 * drawing at all, for when an opaque section covers it completely.
 */
export interface Mood {
	cool: number;
	warm: number;
	energy: number;
	still?: boolean;
}

export const MOODS = {
	dusk: { cool: 0.85, warm: 0.9, energy: 0.8 },
	quiet: { cool: 0.4, warm: 0.3, energy: 0.3 },
	azure: { cool: 1, warm: 0.25, energy: 0.6 },
	split: { cool: 0.75, warm: 0.75, energy: 0.45 },
	low: { cool: 0.3, warm: 0.45, energy: 0.2 },
	screen: { cool: 0.2, warm: 0.2, energy: 0.1, still: true },
	ember: { cool: 0.3, warm: 1, energy: 0.7 }
} satisfies Record<string, Mood>;

export type MoodName = keyof typeof MOODS;

export const mood = writable<MoodName>('dusk');
