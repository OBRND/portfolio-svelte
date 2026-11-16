<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import { mood, MOODS, type Mood } from '$lib/stores/stage';
	import { getScrollState } from '$lib/motion/scroll';

	/**
	 * The sky behind the whole page: a domain-warped noise field lit by the two
	 * brand lights — azure high in the frame, ember along the bottom — drifting
	 * slowly, and re-lit as each section scrolls in.
	 *
	 * It is drawn at a third of the viewport's resolution (a quarter on a
	 * phone) and stretched. The field has no hard edges, so the upscale is
	 * invisible, and it turns a full-screen shader into something a phone can
	 * run without noticing.
	 */

	interface Palette {
		bg: number[];
		cool: number[];
		warm: number[];
		blend: number[];
		/** 0 on the ink ground, 1 on paper — tempers the lights for a light page. */
		light: number;
	}

	const PALETTES: Record<'dark' | 'light', Palette> = {
		dark: {
			bg: [0.027, 0.031, 0.047],
			cool: [0.16, 0.36, 0.95],
			warm: [1.0, 0.33, 0.13],
			blend: [0.5, 0.3, 0.92],
			light: 0
		},
		light: {
			// Clear sky and a warm horizon rather than two pastels: on paper the
			// lights only ever tint the ground, so they need more colour in them
			// than the night pair to read as light at all.
			bg: [0.925, 0.902, 0.851],
			cool: [0.43, 0.63, 1.0],
			warm: [1.0, 0.5, 0.28],
			blend: [0.74, 0.6, 1.0],
			light: 1
		}
	};

	const VERT = `
		attribute vec2 aPos;
		void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
	`;

	/**
	 * `octaves` is how many layers of noise each cloud is built from. The field
	 * is sampled seven times per pixel, so this is the shader's whole cost.
	 */
	const frag = (octaves: number) => `
		precision highp float;
		uniform vec2 uRes;
		uniform float uTime;
		uniform float uScroll;
		uniform vec2 uPointer;
		uniform vec3 uBg;
		uniform vec3 uCool;
		uniform vec3 uWarm;
		uniform vec3 uBlend;
		uniform float uCoolAmt;
		uniform float uWarmAmt;
		uniform float uEnergy;
		uniform float uLight;

		float hash(vec2 p) {
			p = fract(p * vec2(123.34, 456.21));
			p += dot(p, p + 45.32);
			return fract(p.x * p.y);
		}

		float noise(vec2 p) {
			vec2 i = floor(p);
			vec2 f = fract(p);
			vec2 u = f * f * (3.0 - 2.0 * f);
			return mix(
				mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
				mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
				u.y
			);
		}

		float fbm(vec2 p) {
			float v = 0.0;
			float a = 0.5;
			mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
			for (int i = 0; i < ${octaves}; i++) {
				v += a * noise(p);
				p = m * p;
				a *= 0.5;
			}
			return v;
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / uRes;
			vec2 p = uv - 0.5;
			p.x *= uRes.x / uRes.y;

			float t = uTime * 0.03;
			// The field slides as the page scrolls, so the sky is never the
			// same twice on the way down.
			p.y += uScroll * 0.35;

			// Two rounds of domain warping: the noise is fed back into its own
			// coordinates, which is what bends plain cloud into long curtains.
			vec2 q = vec2(fbm(p * 1.05 + vec2(0.0, t)), fbm(p * 1.05 + vec2(5.2, 1.3 - t)));
			vec2 r = vec2(
				fbm(p * 1.35 + 2.4 * q + vec2(1.7, 9.2) + t * 0.6),
				fbm(p * 1.35 + 2.4 * q + vec2(8.3, 2.8) - t * 0.5)
			);
			float f = fbm(p * 1.15 + 2.6 * r);

			// Stretch the field vertically for the cool light so it hangs in
			// streaks like an aurora rather than sitting in blobs.
			float streak = fbm(vec2(p.x * 2.6 + r.x * 1.4, p.y * 0.55 + t * 0.8));

			float high = smoothstep(0.1, 1.05, uv.y + (q.x - 0.5) * 0.7);
			float low = smoothstep(0.92, -0.05, uv.y + (r.y - 0.5) * 0.7);

			float cool = smoothstep(0.36, 0.82, mix(f, streak, 0.55)) * high;
			float warm = smoothstep(0.34, 0.86, r.x * 0.8 + f * 0.35) * low;
			float both = smoothstep(0.42, 0.9, q.y * r.x * 2.1);

			vec3 col = uBg;
			col = mix(col, uCool, cool * uCoolAmt * mix(0.78, 0.66, uLight));
			col = mix(col, uWarm, warm * uWarmAmt * mix(0.8, 0.7, uLight));
			col = mix(col, uBlend, both * uEnergy * 0.42);

			// A faint light that follows the cursor.
			float d = distance(uv * vec2(uRes.x / uRes.y, 1.0), uPointer * vec2(uRes.x / uRes.y, 1.0));
			col += mix(uCool, uWarm, uPointer.x) * smoothstep(0.55, 0.0, d) * 0.07 * (1.0 - uLight * 0.6);

			// Fall back to the plain ground at the edges, so type set near the
			// margins always has a calm field behind it.
			float vig = smoothstep(1.3, 0.3, length(p * vec2(0.85, 1.1)));
			col = mix(uBg, col, mix(0.55, 1.0, vig));

			gl_FragColor = vec4(col, 1.0);
		}
	`;

	let canvas = $state<HTMLCanvasElement | null>(null);
	/** Stays false when WebGL is unavailable; the CSS gradient carries the look. */
	let live = $state(false);

	onMount(() => {
		if (!canvas) return;
		const gl = canvas.getContext('webgl', {
			antialias: false,
			alpha: false,
			powerPreference: 'low-power'
		});
		if (!gl) return;

		const compile = (type: number, source: string) => {
			const shader = gl.createShader(type);
			if (!shader) return null;
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.warn('[atmosphere] shader failed:', gl.getShaderInfoLog(shader));
				return null;
			}
			return shader;
		};

		/*
			A phone gets a cheaper sky: fewer layers of noise, a coarser buffer
			and a lower frame rate. The field has no edges and barely moves, so
			none of the three can be seen — but together they cut the GPU work
			to about a fifth, and that is battery and scroll smoothness.
		*/
		const lite = window.matchMedia('(pointer: coarse), (max-width: 820px)').matches;
		const DIVISOR = lite ? 4 : 3;
		const EVERY = lite ? 3 : 2;

		const vert = compile(gl.VERTEX_SHADER, VERT);
		const fragShader = compile(gl.FRAGMENT_SHADER, frag(lite ? 3 : 5));
		const program = gl.createProgram();
		if (!vert || !fragShader || !program) return;
		gl.attachShader(program, vert);
		gl.attachShader(program, fragShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
		gl.useProgram(program);

		// One oversized triangle covers the viewport with no diagonal seam.
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const aPos = gl.getAttribLocation(program, 'aPos');
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

		const names = [
			'uRes',
			'uTime',
			'uScroll',
			'uPointer',
			'uBg',
			'uCool',
			'uWarm',
			'uBlend',
			'uCoolAmt',
			'uWarmAmt',
			'uEnergy',
			'uLight'
		] as const;
		const u = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)])) as Record<
			(typeof names)[number],
			WebGLUniformLocation | null
		>;

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Everything eased, so neither a theme switch nor a new section snaps.
		const current = {
			bg: [...PALETTES.dark.bg],
			cool: [...PALETTES.dark.cool],
			warm: [...PALETTES.dark.warm],
			blend: [...PALETTES.dark.blend],
			light: 0,
			coolAmt: 0,
			warmAmt: 0,
			energy: 0
		};
		let palette: Palette = PALETTES.dark;
		let target: Mood = MOODS.dusk;
		let first = true;

		const stopTheme = theme.subscribe((mode) => {
			palette = PALETTES[mode] ?? PALETTES.dark;
			if (first) {
				current.bg = [...palette.bg];
				current.cool = [...palette.cool];
				current.warm = [...palette.warm];
				current.blend = [...palette.blend];
				current.light = palette.light;
			}
		});
		const stopMood = mood.subscribe((name) => {
			target = MOODS[name] ?? MOODS.dusk;
		});
		first = false;

		const pointer = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6 };
		const onPointer = (event: PointerEvent) => {
			pointer.tx = event.clientX / window.innerWidth;
			pointer.ty = 1 - event.clientY / window.innerHeight;
		};
		window.addEventListener('pointermove', onPointer, { passive: true });

		const resize = () => {
			const w = Math.max(120, Math.round(window.innerWidth / DIVISOR));
			const h = Math.max(120, Math.round(window.innerHeight / DIVISOR));
			if (canvas!.width !== w || canvas!.height !== h) {
				canvas!.width = w;
				canvas!.height = h;
				gl.viewport(0, 0, w, h);
			}
		};
		resize();
		window.addEventListener('resize', resize);

		const ease = (from: number[], to: readonly number[], k: number) => {
			for (let i = 0; i < 3; i++) from[i] += (to[i] - from[i]) * k;
		};

		let raf = 0;
		let frameIndex = 0;
		let hidden = document.hidden;
		const started = performance.now();

		const draw = (now: number) => {
			raf = requestAnimationFrame(draw);
			// 30fps (20 on a phone) is plenty for something that moves this slowly.
			if (++frameIndex % EVERY || hidden) return;

			// The easing is per drawn frame, so a lower rate needs a bigger step
			// to change mood in the same time.
			const k = lite ? 0.075 : 0.05;
			ease(current.bg, palette.bg, k);
			ease(current.cool, palette.cool, k);
			ease(current.warm, palette.warm, k);
			ease(current.blend, palette.blend, k);
			current.light += (palette.light - current.light) * k;
			current.coolAmt += (target.cool - current.coolAmt) * k;
			current.warmAmt += (target.warm - current.warmAmt) * k;
			current.energy += (target.energy - current.energy) * k;
			pointer.x += (pointer.tx - pointer.x) * 0.06;
			pointer.y += (pointer.ty - pointer.y) * 0.06;

			// An opaque section is covering the sky: keep easing, skip the draw.
			if (target.still && frameIndex > 12) return;

			const scroll = getScrollState();
			gl.uniform2f(u.uRes, canvas!.width, canvas!.height);
			gl.uniform1f(u.uTime, reduced ? 12 : (now - started) / 1000);
			gl.uniform1f(u.uScroll, scroll.vh ? scroll.y / scroll.vh : 0);
			gl.uniform2f(u.uPointer, pointer.x, pointer.y);
			gl.uniform3fv(u.uBg, current.bg);
			gl.uniform3fv(u.uCool, current.cool);
			gl.uniform3fv(u.uWarm, current.warm);
			gl.uniform3fv(u.uBlend, current.blend);
			gl.uniform1f(u.uCoolAmt, current.coolAmt);
			gl.uniform1f(u.uWarmAmt, current.warmAmt);
			gl.uniform1f(u.uEnergy, current.energy);
			gl.uniform1f(u.uLight, current.light);
			gl.drawArrays(gl.TRIANGLES, 0, 3);

			if (!live) live = true;
		};
		raf = requestAnimationFrame(draw);

		const onVisibility = () => {
			hidden = document.hidden;
		};
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			cancelAnimationFrame(raf);
			stopTheme();
			stopMood();
			window.removeEventListener('pointermove', onPointer);
			window.removeEventListener('resize', resize);
			document.removeEventListener('visibilitychange', onVisibility);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	});
</script>

<div class="atmosphere" aria-hidden="true">
	<!-- What shows until the shader has drawn, and for good if WebGL is missing. -->
	<div class="fallback"></div>
	<canvas bind:this={canvas} class:live></canvas>
</div>

<!--
	Film grain over the whole page. Plain alpha rather than a blend mode: a
	blended full-viewport layer forces everything under it to be recomposited
	on every scroll frame, and at this opacity the two are indistinguishable.
-->
<div class="grain" aria-hidden="true"></div>

<style>
	.atmosphere {
		position: fixed;
		inset: 0;
		z-index: var(--z-atmosphere);
		pointer-events: none;
		background: var(--bg);
		overflow: hidden;
	}

	.fallback {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(90% 70% at 22% 0%, color-mix(in srgb, var(--azure) 34%, transparent), transparent 70%),
			radial-gradient(90% 60% at 78% 105%, color-mix(in srgb, var(--ember) 36%, transparent), transparent 70%),
			var(--bg);
	}

	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		opacity: 0;
		transition: opacity 1400ms ease;
	}

	canvas.live {
		opacity: 1;
	}

	.grain {
		position: fixed;
		inset: 0;
		z-index: calc(var(--z-modal) - 1);
		pointer-events: none;
		opacity: 0.09;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1.1 -0.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		background-size: 220px 220px;
	}

	:global(:root.light) .grain {
		opacity: 0.13;
	}
</style>
