import { BLOCK_CHARS } from "../charsets/block";
import type { Grid } from "../grid";
import type { Scale } from "../scale";

export interface BarOptions {
	direction?: "vertical" | "horizontal";
}

export function renderBar(
	grid: Grid,
	values: number[],
	yScale: Scale,
	plotArea: { x: number; y: number; w: number; h: number },
	fg: string | null,
	opts: BarOptions = {},
): void {
	if (values.length === 0) return;
	const { direction = "vertical" } = opts;

	if (direction === "vertical") {
		renderVerticalBars(grid, values, yScale, plotArea, fg);
	} else {
		renderHorizontalBars(grid, values, yScale, plotArea, fg);
	}
}

function renderVerticalBars(
	grid: Grid,
	values: number[],
	yScale: Scale,
	plotArea: { x: number; y: number; w: number; h: number },
	fg: string | null,
): void {
	const gap = 1;
	const totalGaps = values.length - 1;
	const availWidth = plotArea.w - totalGaps;
	const barWidth = Math.max(1, Math.floor(availWidth / values.length));

	const [dMin] = yScale.domain;
	const zeroRow = yScale.map(Math.max(0, dMin));

	for (let i = 0; i < values.length; i++) {
		const v = values[i];
		if (v === undefined) continue;

		const barX = plotArea.x + i * (barWidth + gap);
		const barRow = yScale.map(v);

		const topRow = plotArea.y + plotArea.h - 1 - barRow;
		const bottomRow = plotArea.y + plotArea.h - 1 - zeroRow;

		const yStart = Math.min(topRow, bottomRow);
		const yEnd = Math.max(topRow, bottomRow);

		// Fill the bar entirely with solid █. The previous version used ▇ at
		// the top edge to hint at fractional height, but that leaves a 1/8
		// transparent strip against the terminal background — visible as a
		// dark gap above every bar. Row-level resolution is plenty.
		for (let y = yStart; y <= yEnd; y++) {
			for (let x = barX; x < barX + barWidth && x < plotArea.x + plotArea.w; x++) {
				grid.set(x, y, "█", fg);
			}
		}
	}
}

function renderHorizontalBars(
	grid: Grid,
	values: number[],
	yScale: Scale,
	plotArea: { x: number; y: number; w: number; h: number },
	fg: string | null,
): void {
	const gap = 0;
	const rows = values.length;
	const barHeight = Math.max(1, Math.floor((plotArea.h - (rows - 1) * gap) / rows));

	const [dMin, dMax] = yScale.domain;
	const widthScale = plotArea.w > 0 ? plotArea.w : 1;

	for (let i = 0; i < values.length; i++) {
		const v = values[i];
		if (v === undefined) continue;

		const barY = plotArea.y + i * (barHeight + gap);
		const span = dMax - dMin;
		const normalizedLen = span === 0 ? widthScale : Math.round(((v - dMin) / span) * widthScale);
		const barLen = Math.max(1, normalizedLen);

		for (let y = barY; y < barY + barHeight && y < plotArea.y + plotArea.h; y++) {
			for (let x = plotArea.x; x < plotArea.x + barLen; x++) {
				const ch = x === plotArea.x + barLen - 1 ? fractionalBlock(v, dMin, dMax, widthScale) : "█";
				grid.set(x, y, ch, fg);
			}
		}
	}
}

function fractionalBlock(v: number, min: number, max: number, totalWidth: number): string {
	const span = max - min;
	if (span === 0) return "█";
	const exact = ((v - min) / span) * totalWidth;
	const frac = exact - Math.floor(exact);
	const idx = Math.round(frac * (BLOCK_CHARS.length - 1));
	return BLOCK_CHARS[Math.max(1, Math.min(idx, BLOCK_CHARS.length - 1))] ?? "█";
}
