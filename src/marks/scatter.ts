import { createBrailleCanvas } from "../charsets/braille";
import type { Grid } from "../grid";
import { linearScale } from "../scale";

export function renderScatter(
	grid: Grid,
	xValues: number[],
	yValues: number[],
	xDomain: [number, number],
	yDomain: [number, number],
	plotArea: { x: number; y: number; w: number; h: number },
	fg: string | null,
	charset: string = "braille",
): void {
	if (xValues.length === 0) return;

	if (charset === "braille" || charset === "box") {
		const xScale = linearScale(xDomain, [0, plotArea.w * 2 - 1]);
		const yScale = linearScale(yDomain, [0, plotArea.h * 4 - 1]);
		renderScatterBraille(grid, xValues, yValues, xScale, yScale, plotArea, fg);
	} else {
		const xScale = linearScale(xDomain, [0, plotArea.w - 1]);
		const yScale = linearScale(yDomain, [0, plotArea.h - 1]);
		renderScatterDirect(grid, xValues, yValues, xScale, yScale, plotArea, fg, charset);
	}
}

function renderScatterBraille(
	grid: Grid,
	xValues: number[],
	yValues: number[],
	xScale: ReturnType<typeof linearScale>,
	yScale: ReturnType<typeof linearScale>,
	plotArea: { x: number; y: number; w: number; h: number },
	fg: string | null,
): void {
	const canvas = createBrailleCanvas(plotArea.w, plotArea.h);

	for (let i = 0; i < xValues.length; i++) {
		const xv = xValues[i];
		const yv = yValues[i];
		if (xv === undefined || yv === undefined) continue;

		const px = xScale.map(xv);
		const py = canvas.height - 1 - yScale.map(yv);
		canvas.set(px, py);
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

function renderScatterDirect(
	grid: Grid,
	xValues: number[],
	yValues: number[],
	xScale: ReturnType<typeof linearScale>,
	yScale: ReturnType<typeof linearScale>,
	plotArea: { x: number; y: number; w: number; h: number },
	fg: string | null,
	charset: string,
): void {
	const dot = charset === "block" ? "●" : "*";

	for (let i = 0; i < xValues.length; i++) {
		const xv = xValues[i];
		const yv = yValues[i];
		if (xv === undefined || yv === undefined) continue;

		const col = xScale.map(xv);
		const row = plotArea.h - 1 - yScale.map(yv);
		grid.set(plotArea.x + col, plotArea.y + row, dot, fg);
	}
}
