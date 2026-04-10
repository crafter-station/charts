import { createBrailleCanvas } from "../charsets/braille";
import type { Grid } from "../grid";
import type { Scale } from "../scale";

export function renderLine(
	grid: Grid,
	values: number[],
	xScale: Scale,
	yScale: Scale,
	plotArea: { x: number; y: number; w: number; h: number },
	fg: string | null,
): void {
	const canvas = createBrailleCanvas(plotArea.w, plotArea.h);

	for (let i = 0; i < values.length; i++) {
		const v = values[i];
		if (v === undefined) continue;

		const px = Math.round((i / Math.max(values.length - 1, 1)) * (canvas.width - 1));
		const py = canvas.height - 1 - yScale.map(v);

		canvas.set(px, py);

		if (i > 0) {
			const prevV = values[i - 1];
			if (prevV === undefined) continue;
			const prevPx = Math.round(((i - 1) / Math.max(values.length - 1, 1)) * (canvas.width - 1));
			const prevPy = canvas.height - 1 - yScale.map(prevV);
			interpolatePixels(canvas, prevPx, prevPy, px, py);
		}
	}

	const lines = canvas.render();
	for (let row = 0; row < lines.length; row++) {
		const line = lines[row];
		if (!line) continue;
		for (let col = 0; col < line.length; col++) {
			const ch = line[col];
			if (!ch || ch === String.fromCharCode(0x2800)) continue;
			grid.set(plotArea.x + col, plotArea.y + row, ch, fg);
		}
	}
}

function interpolatePixels(
	canvas: { set(x: number, y: number): void },
	x0: number,
	y0: number,
	x1: number,
	y1: number,
): void {
	const dx = Math.abs(x1 - x0);
	const dy = Math.abs(y1 - y0);
	const sx = x0 < x1 ? 1 : -1;
	const sy = y0 < y1 ? 1 : -1;
	let err = dx - dy;
	let cx = x0;
	let cy = y0;

	while (cx !== x1 || cy !== y1) {
		const e2 = 2 * err;
		if (e2 > -dy) {
			err -= dy;
			cx += sx;
		}
		if (e2 < dx) {
			err += dx;
			cy += sy;
		}
		canvas.set(cx, cy);
	}
}
