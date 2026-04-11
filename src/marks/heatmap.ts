import type { Grid } from "../grid";
import { ANSI_COLORS, ANSI_RESET, type AnsiColor } from "../types";

/**
 * Default 5-step density ramp. Position 0 is reserved for "value at min" (often
 * zero) and uses a blank space so the chart area reads as empty when data is
 * sparse. Use `zero: "░"` to make empty cells visible when you want the whole
 * chart area to have a visual presence (e.g. activity heatmaps where absence
 * is meaningful).
 */
const HEAT_CHARS = [" ", "░", "▒", "▓", "█"];

export interface HeatmapOptions {
	width?: number;
	color?: AnsiColor;
	labels?: { rows?: string[]; cols?: string[] };
	/**
	 * How many characters wide each cell should be when rendered inline.
	 * Default is 2 (square-ish in a terminal where char height > width).
	 * Pass 1 for the most compact form — useful when you want a sparkline-like
	 * row that uses heatmap glyphs instead of fractional blocks.
	 */
	cellWidth?: number;
	/**
	 * Character to use for the "minimum" bucket. When absent (undefined), the
	 * default ramp starts with a blank space so zero values are invisible.
	 * Pass "░" (light shade) to make zero cells visible as a textured background
	 * — useful when you want the chart to look like a filled rectangle with
	 * brighter patches for active values.
	 */
	zero?: string;
}

export function renderHeatmap(
	grid: Grid,
	data: number[][],
	plotArea: { x: number; y: number; w: number; h: number },
	fg: string | null,
): void {
	if (data.length === 0) return;

	const rows = data.length;
	const cols = Math.max(...data.map((r) => r.length));
	if (cols === 0) return;

	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;
	for (const row of data) {
		for (const v of row) {
			if (v < min) min = v;
			if (v > max) max = v;
		}
	}
	const range = max - min || 1;

	const cellW = Math.max(1, Math.floor(plotArea.w / cols));
	const cellH = Math.max(1, Math.floor(plotArea.h / rows));

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const v = data[r]?.[c] ?? 0;
			const normalized = (v - min) / range;
			const charIdx = Math.round(normalized * (HEAT_CHARS.length - 1));
			const ch = HEAT_CHARS[charIdx] ?? " ";

			for (let dy = 0; dy < cellH && plotArea.y + r * cellH + dy < plotArea.y + plotArea.h; dy++) {
				for (let dx = 0; dx < cellW && plotArea.x + c * cellW + dx < plotArea.x + plotArea.w; dx++) {
					grid.set(plotArea.x + c * cellW + dx, plotArea.y + r * cellH + dy, ch, fg);
				}
			}
		}
	}
}

export function sparkHeatmap(data: number[][], options: HeatmapOptions = {}): string {
	if (data.length === 0) return "";

	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;
	for (const row of data) {
		for (const v of row) {
			if (v < min) min = v;
			if (v > max) max = v;
		}
	}
	const range = max - min || 1;

	const cellWidth = Math.max(1, Math.floor(options.cellWidth ?? 2));

	// Build the ramp. If the caller provided a zero char, substitute it in the
	// lowest slot so empty data is visible instead of blank.
	const ramp = options.zero !== undefined
		? [options.zero, ...HEAT_CHARS.slice(1)]
		: HEAT_CHARS;

	const fg = options.color ? ANSI_COLORS[options.color] : null;
	const lines: string[] = [];

	const rowLabels = options.labels?.rows;
	const colLabels = options.labels?.cols;
	const labelW = rowLabels ? Math.max(...rowLabels.map((l) => l.length)) + 1 : 0;

	if (colLabels) {
		const header = " ".repeat(labelW) + colLabels.map((l) => l.slice(0, cellWidth).padEnd(cellWidth)).join("");
		lines.push(header);
	}

	for (let r = 0; r < data.length; r++) {
		const row = data[r]!;
		const prefix = rowLabels?.[r] ? (rowLabels[r]!).padStart(labelW - 1) + " " : "";
		const cells = row.map((v) => {
			const normalized = (v - min) / range;
			const charIdx = Math.round(normalized * (ramp.length - 1));
			return (ramp[charIdx] ?? " ").repeat(cellWidth);
		}).join("");

		if (fg) {
			lines.push(`${prefix}${fg}${cells}${ANSI_RESET}`);
		} else {
			lines.push(`${prefix}${cells}`);
		}
	}

	return lines.join("\n");
}
