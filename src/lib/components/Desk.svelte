<!-- Decorative objects share the devices' perspective and material palette. -->
<div class="desk" aria-hidden="true">
	<div class="board">
		<div class="surface">
			<div class="desk-mat"></div>
			<div class="notebook">
				<div class="pages"></div>
				<div class="cover">
					<span class="book-label">FIELD NOTES<span>Ideas / build / repeat</span></span>
					<span class="book-mark">&lt;/&gt;</span>
				</div>
				<span class="elastic"></span>
				<span class="bookmark"></span>
			</div>
			<div class="pen"><span></span></div>
			<div class="mouse"><span></span></div>
			<div class="coffee">
				<div class="coaster"></div>
				{#each { length: 24 } as _, i}
					<div class="cup-side" style="--turn: {i * 15}deg; --cup-light: {65 + Math.cos(i * Math.PI / 12) * 30}%"></div>
				{/each}
				<div class="cup-handle"></div>
				<div class="cup-top"></div>
			</div>
		</div>
		<div class="board-edge front"></div>
		<div class="board-edge left"></div>
		<div class="board-edge right"></div>
	</div>
</div>

<style>
	.desk {
		--board-depth: calc(var(--H) * 1.95);
		--board-thick: calc(var(--u) * 2.2);
		position: absolute;
		left: calc(50% - var(--W) * 1.3);
		top: calc(50% + var(--H) / 2 + var(--bezel) + var(--u) * 1.5 + 3px);
		width: calc(var(--W) * 2.25);
		height: var(--board-depth);
		transform: translateZ(calc(var(--H) * -0.16)) rotateX(90deg);
		transform-origin: 50% 0;
		transform-style: preserve-3d;
		pointer-events: none;
	}

	.board {
		position: absolute;
		inset: 0;
		transform-style: preserve-3d;
	}

	.surface {
		position: absolute;
		inset: 0;
		border-radius: calc(var(--u) * 1.8);
		background:
			linear-gradient(115deg, #ffffff0c, transparent 45%, #00000026),
			repeating-linear-gradient(2deg, #b08a5c0b 0 1px, transparent 1px 7px),
			linear-gradient(100deg, #5c4939, #77604a 46%, #4b3c31);
		box-shadow:
			inset 0 0 0 2px #d5b38c35,
			0 0 calc(var(--u) * 5) #00000030,
			0 calc(var(--u) * 4) calc(var(--u) * 9) #00000040;
		transform-style: preserve-3d;
	}

	.board-edge {
		position: absolute;
		background: linear-gradient(#6a503b, #382b23);
		border-bottom: 2px solid #231d19;
	}

	.front {
		left: 0;
		top: 100%;
		width: 100%;
		height: var(--board-thick);
		transform-origin: 50% 0;
		transform: rotateX(-90deg);
		border-radius: 0 0 calc(var(--u) * 1.2) calc(var(--u) * 1.2);
	}

	.left,
	.right {
		top: 0;
		width: var(--board-thick);
		height: 100%;
	}

	.left {
		right: 100%;
		transform-origin: 100% 50%;
		transform: rotateY(-90deg);
	}

	.right {
		left: 100%;
		transform-origin: 0 50%;
		transform: rotateY(90deg);
	}

	.desk-mat {
		position: absolute;
		inset: 10% 7% 29% 30%;
		border-radius: calc(var(--u) * 2);
		border: 2px solid #ffffff13;
		background: linear-gradient(120deg, #303534, #202524);
		box-shadow: 0 4px 5px #00000030, inset 0 0 0 6px #00000015;
	}

	.notebook {
		position: absolute;
		left: 22%;
		top: 67%;
		width: 20%;
		height: 28%;
		transform: translateZ(calc(var(--u) * 0.8)) rotateZ(-9deg);
		transform-style: preserve-3d;
	}

	.pages,
	.cover {
		position: absolute;
		inset: 0;
		border-radius: 4px calc(var(--u) * 0.6) calc(var(--u) * 0.6) 4px;
	}

	.pages {
		inset: 2% -0.5% -2% 2%;
		background: #d9d0bb;
		box-shadow: 0 3px #9c9585, 0 6px #e1d9c6, 0 9px #263d37, 4px 14px 18px #00000055;
	}

	.cover {
		padding: 12% 12% 12% 16%;
		border: 1px solid #9daf8f55;
		background: linear-gradient(100deg, #233e34 4%, #49634e 5%, #344e40 8%, #405a48);
		box-shadow: inset -2px 2px 2px #ffffff12;
		color: #c4c4a3;
	}

	.book-label {
		display: grid;
		gap: calc(var(--u) * 0.65);
		font: 500 calc(var(--u) * 1.35) / 1.2 var(--font-mono);
		letter-spacing: 0.12em;
	}

	.book-label span {
		font-size: 0.5em;
		letter-spacing: 0.04em;
	}

	.book-mark {
		position: absolute;
		bottom: 14%;
		font: calc(var(--u) * 2.5) / 1 var(--font-mono);
		opacity: 0.7;
	}

	.elastic {
		position: absolute;
		inset: -1% 13% -2% auto;
		width: 3.5%;
		background: #1c3029;
		box-shadow: 2px 0 2px #00000035;
	}

	.bookmark {
		position: absolute;
		top: 100%;
		left: 19%;
		width: 4%;
		height: 9%;
		background: #d89562;
	}

	.pen {
		position: absolute;
		left: 45%;
		top: 73%;
		width: 1.1%;
		height: 23%;
		border-radius: 5px 5px 45% 45%;
		background: linear-gradient(90deg, #171c20, #51585d 44%, #242a2e 70%);
		box-shadow: 5px 7px 5px #00000050;
		transform: translateZ(5px) rotateZ(13deg);
	}

	.pen span {
		position: absolute;
		inset: 7% 22% 65% auto;
		width: 18%;
		border-radius: 2px;
		background: var(--alu-1);
	}

	.mouse {
		position: absolute;
		right: 9%;
		top: 35%;
		width: 7%;
		height: 22%;
		border-radius: 46% 46% 44% 44%;
		background: radial-gradient(ellipse at 40% 30%, #eff0f2, var(--alu-1) 40%, var(--alu-3) 90%);
		box-shadow: inset -3px -5px 5px #00000025, 3px 8px 0 var(--alu-edge), 5px 15px 16px #00000050;
		transform: translateZ(calc(var(--u) * 1.8)) rotateZ(-8deg);
	}

	.mouse::before {
		content: '';
		position: absolute;
		left: 50%;
		top: 1%;
		height: 37%;
		width: 1px;
		background: var(--alu-3);
	}

	.mouse span {
		position: absolute;
		left: 44%;
		top: 18%;
		width: 12%;
		height: 18%;
		border-radius: 20px;
		background: linear-gradient(90deg, #282c30, #5f656c, #282c30);
	}

	.coffee {
		--cup: calc(var(--u) * 13);
		--cup-h: calc(var(--u) * 12);
		position: absolute;
		left: 6%;
		top: 16%;
		width: var(--cup);
		height: var(--cup);
		transform-style: preserve-3d;
	}

	.coaster {
		position: absolute;
		inset: -15%;
		border-radius: 50%;
		background: #ac855d;
		box-shadow: 0 4px #6c5038, 8px 10px 12px #00000040;
	}

	.cup-side {
		position: absolute;
		left: calc(50% - var(--cup) * 0.067);
		top: 50%;
		width: calc(var(--cup) * 0.134);
		height: var(--cup-h);
		transform-origin: 50% 0;
		transform: rotateZ(var(--turn)) translateY(calc(var(--cup) * -0.5)) rotateX(90deg);
		background: color-mix(in srgb, #e6e2d4 var(--cup-light), #777e76);
	}

	.cup-top {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		border: calc(var(--u) * 0.9) solid #e6e2d4;
		background: radial-gradient(ellipse at 45% 40%, #5a3825, #352117 70%);
		box-shadow: inset 0 0 0 3px #a99d84, inset 4px 7px 10px #160d0a;
		transform: translateZ(var(--cup-h));
	}

	.cup-handle {
		position: absolute;
		left: 90%;
		top: 50%;
		width: 45%;
		height: calc(var(--cup-h) * 0.65);
		border: calc(var(--u) * 1.1) solid #c6c8bb;
		border-radius: 30% 55% 55% 30%;
		transform-origin: 50% 0;
		transform: translateZ(calc(var(--cup-h) * 0.2)) rotateX(90deg);
	}

	:global(.showcase.compact) .desk {
		left: calc(50% - var(--W) * 0.98);
		width: calc(var(--W) * 1.85);
	}

	:global(.showcase.compact) .notebook {
		left: 5%;
		width: 25%;
		top: 62%;
		height: 33%;
	}

	:global(.showcase.compact) .pen {
		left: 34%;
	}

	:global(.showcase.compact) .mouse {
		display: none;
	}
</style>
