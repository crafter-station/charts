const BRAILLE_BASE = 0x2800;
const BRAILLE_DOTS: [number, number][] = [
	[0, 0], // dot 1 (0x01)
	[0, 1], // dot 2 (0x02)
	[0, 2], // dot 3 (0x04)
	[1, 0], // dot 4 (0x08)
	[1, 1], // dot 5 (0x10)
	[1, 2], // dot 6 (0x20)
	[0, 3], // dot 7 (0x40)
	[1, 3], // dot 8 (0x80)
];

const DOT_OFFSETS = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80];

export interface BrailleCanvas {
	width: number;
	height: number;
	set(x: number, y: number): void;
	render(): string[];
}

export function createBrailleCanvas(charWidth: number, charHeight: number): BrailleCanvas {
	const pixelWidth = charWidth * 2;
	const pixelHeight = charHeight * 4;
	const buffer = new Uint8Array(charWidth * charHeight);

	return {
		width: pixelWidth,
		height: pixelHeight,
		set(px: number, py: number) {
			if (px < 0 || px >= pixelWidth || py < 0 || py >= pixelHeight) return;
			const cx = Math.floor(px / 2);
			const cy = Math.floor(py / 4);
			const dx = px % 2;
			const dy = py % 4;
			const dotIndex = BRAILLE_DOTS.findIndex(([x, y]) => x === dx && y === dy);
			if (dotIndex === -1) return;
			const idx = cy * charWidth + cx;
			if (idx < buffer.length) {
				buffer[idx]! |= DOT_OFFSETS[dotIndex]!;
			}
		},
		render() {
			const lines: string[] = [];
			for (let cy = 0; cy < charHeight; cy++) {
				let line = "";
				for (let cx = 0; cx < charWidth; cx++) {
					const idx = cy * charWidth + cx;
					line += String.fromCharCode(BRAILLE_BASE + (buffer[idx] ?? 0));
				}
				lines.push(line);
			}
			return lines;
		},
	};
}
