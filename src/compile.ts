import { renderXAxis, renderYAxis } from "./axis";
import { encodeAnsi } from "./encoders/ansi";
import { encodeHtml } from "./encoders/html";
import { encodeString } from "./encoders/string";
import { createGrid, detectWidth } from "./grid";
import { renderBar } from "./marks/bar";
import { renderCandlestick } from "./marks/candlestick";
import { renderLine, renderLineBox } from "./marks/line";
import { renderScatter } from "./marks/scatter";
import { autoExtent, linearScale } from "./scale";
import type { ChartSpec } from "./spec";
import { ANSI_COLORS, ANSI_RESET, type AnsiColor } from "./types";

const Y_AXIS_WIDTH = 8;
const X_AXIS_HEIGHT = 2;
const LEGEND_HEIGHT = 1;

export function renderChartToAnsi(spec: ChartSpec): string {
	const grid = compile(spec);
	return encodeAnsi(grid);
}

export function renderChartToString(spec: ChartSpec): string {
	const grid = compile(spec);
	return encodeString(grid);
}

export function renderChartToHtml(spec: ChartSpec): string {
	const grid = compile(spec);
	return encodeHtml(grid);
}

function autoHeight(width: number): number {
	return Math.max(8, Math.min(25, Math.round(width / 4)));
}

function compile(spec: ChartSpec) {
	const totalWidth = spec.width === "auto" ? detectWidth() : spec.width;
	const rawHeight = spec.height === "auto" ? autoHeight(totalWidth) : spec.height;

	const hasXAxis = spec.xAxis !== null;
	const hasLegend = spec.marks.some((m) => m.label);
	const bottomReserved = (hasXAxis ? X_AXIS_HEIGHT : 0) + (hasLegend ? LEGEND_HEIGHT : 0);
	const totalHeight = rawHeight + bottomReserved;

	const plotArea = {
		x: Y_AXIS_WIDTH,
		y: 0,
		w: totalWidth - Y_AXIS_WIDTH,
		h: rawHeight,
	};

	const grid = createGrid(totalWidth, totalHeight);

	const allValues: number[] = [];
	const allXValues: number[] = [];
	for (const mark of spec.marks) {
		if (mark.type === "candlestick" && spec._candlestickKeys) {
			const keys = spec._candlestickKeys;
			for (const row of spec.data) {
				for (const k of [keys.open, keys.high, keys.low, keys.close]) {
					const v = row[k];
					if (v !== undefined) allValues.push(v);
				}
				const xv = row[spec.xKey];
				if (xv !== undefined) allXValues.push(xv);
			}
		} else {
			for (const row of spec.data) {
				const v = row[mark.key];
				if (v !== undefined) allValues.push(v);
				const xv = row[spec.xKey];
				if (xv !== undefined) allXValues.push(xv);
			}
		}
	}

	if (allValues.length === 0) return grid;

	const [yMin, yMax] = spec.yDomain ?? autoExtent(allValues);
	const gridYScale = linearScale([yMin, yMax], [0, plotArea.h - 1]);
	const brailleYScale = linearScale([yMin, yMax], [0, plotArea.h * 4 - 1]);

	const [xMin, xMax] = allXValues.length > 0 ? autoExtent(allXValues) : [0, 1] as [number, number];
	const brailleXScale = linearScale([xMin, xMax], [0, plotArea.w * 2 - 1]);
	const gridXScale = linearScale([xMin, xMax], [0, plotArea.w - 1]);

	for (const mark of spec.marks) {
		if (mark.type === "line") {
			const values = spec.data.map((row) => row[mark.key] ?? 0);
			if (spec.charset === "box") {
				renderLineBox(grid, values, gridYScale, plotArea, mark.color ?? null);
			} else {
				renderLine(grid, values, brailleYScale, brailleYScale, plotArea, mark.color ?? null);
			}
		} else if (mark.type === "bar") {
			const values = spec.data.map((row) => row[mark.key] ?? 0);
			renderBar(grid, values, gridYScale, plotArea, mark.color ?? null);
		} else if (mark.type === "scatter") {
			const xVals = spec.data.map((row) => row[spec.xKey] ?? 0);
			const yVals = spec.data.map((row) => row[mark.key] ?? 0);
			renderScatter(grid, xVals, yVals, [xMin, xMax], [yMin, yMax], plotArea, mark.color ?? null, spec.charset);
		} else if (mark.type === "candlestick" && spec._candlestickKeys) {
			renderCandlestick(grid, spec.data, spec._candlestickKeys, gridYScale, plotArea);
		}
	}

	renderYAxis(grid, gridYScale, plotArea, spec.yAxis);

	if (hasXAxis) {
		renderXAxis(grid, gridXScale, plotArea, spec.xAxis);
	}

	if (hasLegend) {
		renderLegend(grid, spec.marks, plotArea, rawHeight + (hasXAxis ? X_AXIS_HEIGHT : 0));
	}

	return grid;
}

function renderLegend(
	grid: ReturnType<typeof createGrid>,
	marks: ChartSpec["marks"],
	plotArea: { x: number; w: number },
	y: number,
): void {
	let col = plotArea.x;
	for (const mark of marks) {
		if (!mark.label) continue;
		const color = mark.color ?? null;
		const symbol = mark.type === "line" ? "─" : mark.type === "scatter" ? "•" : "█";

		grid.set(col, y, symbol, color);
		col += 1;
		const text = ` ${mark.label}  `;
		for (let i = 0; i < text.length; i++) {
			const ch = text[i];
			if (ch && col + i < plotArea.x + plotArea.w) {
				grid.set(col + i, y, ch);
			}
		}
		col += text.length;
	}
}
