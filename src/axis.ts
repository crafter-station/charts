import type { Grid } from "./grid";
import type { Scale } from "./scale";
import type { AxisDef } from "./spec";

export function renderYAxis(
	grid: Grid,
	scale: Scale,
	plotArea: { x: number; y: number; h: number },
	axisDef: AxisDef | null,
): void {
	const [min, max] = scale.domain;
	const ticks = computeTicks(min, max, Math.min(plotArea.h, 6));
	const formatFn = resolveFormat(axisDef);

	for (const tick of ticks) {
		const py = plotArea.y + plotArea.h - 1 - scale.map(tick);
		if (py < plotArea.y || py >= plotArea.y + plotArea.h) continue;

		const label = formatFn(tick);
		const labelStart = plotArea.x - label.length - 1;

		for (let i = 0; i < label.length; i++) {
			const ch = label[i];
			if (ch && labelStart + i >= 0) {
				grid.set(labelStart + i, py, ch);
			}
		}
		grid.set(plotArea.x - 1, py, "┤");
	}

	for (let y = plotArea.y; y < plotArea.y + plotArea.h; y++) {
		const cell = grid.get(plotArea.x - 1, y);
		if (cell && cell.char === " ") {
			grid.set(plotArea.x - 1, y, "│");
		}
	}
}

export function renderXAxis(
	grid: Grid,
	scale: Scale,
	plotArea: { x: number; y: number; w: number; h: number },
	axisDef: AxisDef | null,
): void {
	const [min, max] = scale.domain;
	const maxTicks = Math.min(Math.floor(plotArea.w / 8), 10);
	const ticks = computeTicks(min, max, maxTicks);
	const formatFn = resolveFormat(axisDef);

	const axisY = plotArea.y + plotArea.h;

	for (let x = plotArea.x; x < plotArea.x + plotArea.w; x++) {
		grid.set(x, axisY, "─");
	}

	for (const tick of ticks) {
		const px = plotArea.x + scale.map(tick);
		if (px < plotArea.x || px >= plotArea.x + plotArea.w) continue;

		grid.set(px, axisY, "┴");

		const label = formatFn(tick);
		const labelStart = px - Math.floor(label.length / 2);
		for (let i = 0; i < label.length; i++) {
			const lx = labelStart + i;
			if (lx >= plotArea.x && lx < plotArea.x + plotArea.w) {
				const ch = label[i];
				if (ch) grid.set(lx, axisY + 1, ch);
			}
		}
	}
}

function computeTicks(min: number, max: number, maxTicks: number): number[] {
	if (maxTicks <= 1) return [min];
	const range = max - min;
	if (range === 0) return [min];

	const rawStep = range / (maxTicks - 1);
	const magnitude = 10 ** Math.floor(Math.log10(rawStep));
	const candidates = [1, 2, 5, 10];
	let step = magnitude;
	for (const c of candidates) {
		if (c * magnitude >= rawStep) {
			step = c * magnitude;
			break;
		}
	}

	const ticks: number[] = [];
	const start = Math.ceil(min / step) * step;
	for (let v = start; v <= max + step * 0.001; v += step) {
		ticks.push(Math.round(v * 1e10) / 1e10);
	}
	return ticks;
}

function resolveFormat(axisDef: AxisDef | null): (v: number) => string {
	if (!axisDef?.format) return defaultFormat;
	if (typeof axisDef.format === "function") return axisDef.format;
	if (axisDef.format === "number") return defaultFormat;
	return defaultFormat;
}

function defaultFormat(v: number): string {
	if (Number.isInteger(v)) return v.toString();
	if (Math.abs(v) >= 1000) return v.toFixed(0);
	if (Math.abs(v) >= 1) return v.toFixed(1);
	return v.toPrecision(3);
}
