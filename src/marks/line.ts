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

export function renderLineBox(
	grid: Grid,
	values: number[],
	yScale: Scale,
	plotArea: { x: number; y: number; w: number; h: number },
	fg: string | null,
): void {
	if (values.length === 0) return;

	const mapped = values.map((v) => (v === undefined ? undefined : plotArea.h - 1 - yScale.map(v)));

	for (let i = 0; i < mapped.length; i++) {
		const y0 = mapped[i];
		if (y0 === undefined) continue;

		const col = plotArea.x + Math.round((i / Math.max(mapped.length - 1, 1)) * (plotArea.w - 1));
		const prevCol = i > 0 ? plotArea.x + Math.round(((i - 1) / Math.max(mapped.length - 1, 1)) * (plotArea.w - 1)) : col;

		if (i === 0) {
			grid.set(col, plotArea.y + y0, "─", fg);
			continue;
		}

		const y1 = mapped[i - 1];
		if (y1 === undefined) continue;

		if (y0 === y1) {
			for (let c = prevCol + 1; c <= col; c++) grid.set(c, plotArea.y + y0, "─", fg);
		} else {
			// Horizontal from prev point to current column at prev height
			for (let c = prevCol + 1; c < col; c++) grid.set(c, plotArea.y + y1, "─", fg);

			// Vertical transition at current column
			if (y0 < y1) {
				// Going up: corner at top (y0) and bottom (y1)
				grid.set(col, plotArea.y + y0, "╭", fg);
				grid.set(col, plotArea.y + y1, "╯", fg);
				for (let y = y0 + 1; y < y1; y++) grid.set(col, plotArea.y + y, "│", fg);
			} else {
				// Going down: corner at top (y1) and bottom (y0)
				grid.set(col, plotArea.y + y1, "╮", fg);
				grid.set(col, plotArea.y + y0, "╰", fg);
				for (let y = y1 + 1; y < y0; y++) grid.set(col, plotArea.y + y, "│", fg);
			}
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
