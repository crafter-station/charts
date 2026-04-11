import { ANSI_COLORS, ANSI_RESET, type AnsiColor } from "../types";

// ── Column Sparkline ────────────────────────────────────
// Mini vertical bars inline. Supports negative values (below baseline).
// Uses upper/lower block elements for positive/negative.

const COL_UP = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
const COL_DOWN = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

export interface ColumnSparklineOptions {
	width?: number;
	color?: AnsiColor;
	negColor?: AnsiColor;
}

export function sparkColumn(data: number[], options: ColumnSparklineOptions = {}): string {
	if (data.length === 0) return "";

	const width = options.width ?? data.length;
	const sampled = downsample(data, width);
	const absMax = Math.max(...sampled.map(Math.abs), 1);
	const posColor = options.color ? ANSI_COLORS[options.color] : null;
	const negColor = options.negColor ? ANSI_COLORS[options.negColor] : (posColor ? ANSI_COLORS.red : null);

	let result = "";
	for (const v of sampled) {
		const normalized = Math.abs(v) / absMax;
		const idx = Math.min(Math.round(normalized * (COL_UP.length - 1)), COL_UP.length - 1);

		if (v >= 0) {
			const ch = COL_UP[idx] ?? "▁";
			result += posColor ? `${posColor}${ch}${ANSI_RESET}` : ch;
		} else {
			const ch = COL_DOWN[idx] ?? "▁";
			const c = negColor ?? "";
			const r = negColor ? ANSI_RESET : "";
			result += `${c}${ch}${r}`;
		}
	}
	return result;
}

// ── Bar Sparkline (Progress Bar) ────────────────────────
// Horizontal fill bar with optional percentage label.
// Uses block elements for partial fill.

const BAR_BLOCKS = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];

export interface BarSparklineOptions {
	width?: number;
	color?: AnsiColor;
	bgColor?: AnsiColor;
	showPercent?: boolean;
}

export function sparkBar(value: number, max: number, options: BarSparklineOptions = {}): string {
	const width = options.width ?? 20;
	const ratio = Math.max(0, Math.min(1, value / max));
	const filled = ratio * width;
	const fullBlocks = Math.floor(filled);
	const partialIdx = Math.round((filled - fullBlocks) * (BAR_BLOCKS.length - 1));
	const partial = BAR_BLOCKS[partialIdx] ?? "";
	const empty = width - fullBlocks - (partial !== " " && partial !== "" ? 1 : 0);

	let bar = "█".repeat(fullBlocks) + partial + " ".repeat(Math.max(0, empty));
	bar = bar.slice(0, width);

	const fg = options.color ? ANSI_COLORS[options.color] : null;
	const label = options.showPercent ? ` ${Math.round(ratio * 100)}%` : "";

	if (fg) return `${fg}${bar}${ANSI_RESET}${label}`;
	return bar + label;
}

// ── Win/Loss Sparkline ──────────────────────────────────
// Binary up/down blocks. Green for win (positive), red for loss (negative/zero).

export interface WinLossOptions {
	winColor?: AnsiColor;
	lossColor?: AnsiColor;
}

export function sparkWinLoss(data: number[], options: WinLossOptions = {}): string {
	if (data.length === 0) return "";

	const winC = ANSI_COLORS[options.winColor ?? "green"];
	const lossC = ANSI_COLORS[options.lossColor ?? "red"];

	return data
		.map((v) => (v > 0 ? `${winC}▀${ANSI_RESET}` : `${lossC}▄${ANSI_RESET}`))
		.join("");
}

// ── Area Sparkline ──────────────────────────────────────
// Multi-row filled sparkline. Below the curve, cells are always solid `█`;
// the top-most row of each bar uses a fractional block (▁▂▃…▇) so the
// silhouette follows the data smoothly.
//
// The subtle correctness point: in the old implementation each row decided
// independently whether to show ▁, ▄, █ or space, which produced negative-space
// triangles inside the filled area (the "cheese holes" bug). The new version
// computes a single integer height per cell and fills every row *below* that
// top row with solid `█`, guaranteeing a closed, contiguous shape.

export interface AreaSparklineOptions {
	width?: number;
	height?: number;
	color?: AnsiColor;
	/**
	 * Character for cells above the curve. Defaults to " " (space) so the
	 * chart sits naturally on the terminal background. Pass "░" for a visible
	 * plot area that frames the data.
	 */
	background?: string;
}

export function sparkArea(data: number[], options: AreaSparklineOptions = {}): string {
	if (data.length === 0) return "";

	const width = options.width ?? data.length;
	const height = options.height ?? 3;
	const sampled = downsample(data, width);
	const min = Math.min(...sampled);
	const max = Math.max(...sampled);
	const range = max - min || 1;
	const background = options.background ?? " ";
	const fg = options.color ? ANSI_COLORS[options.color] : null;

	// One fractional block for each eighth of a cell — used for the very top
	// row of every bar so the silhouette is smooth.
	const TOP_BLOCKS = [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"] as const;

	// For each cell, compute how many total eighths of vertical space the bar
	// fills (0 = empty, height*8 = fully filled).
	const eighths = sampled.map((v) => {
		const normalized = (v - min) / range;
		return Math.round(normalized * height * 8);
	});

	const lines: string[] = [];
	for (let row = height - 1; row >= 0; row--) {
		let line = "";
		for (const e of eighths) {
			const rowEighths = e - row * 8;
			if (rowEighths >= 8) {
				line += "█";
			} else if (rowEighths <= 0) {
				line += background;
			} else {
				line += TOP_BLOCKS[rowEighths] ?? "▁";
			}
		}
		if (fg) lines.push(`${fg}${line}${ANSI_RESET}`);
		else lines.push(line);
	}

	return lines.join("\n");
}

// ── Shared ──────────────────────────────────────────────

function downsample(data: number[], targetWidth: number): number[] {
	if (data.length <= targetWidth) return data;
	const result: number[] = [];
	const bucketSize = data.length / targetWidth;
	for (let i = 0; i < targetWidth; i++) {
		const start = Math.floor(i * bucketSize);
		const end = Math.floor((i + 1) * bucketSize);
		let sum = 0;
		let count = 0;
		for (let j = start; j < end && j < data.length; j++) {
			sum += data[j]!;
			count++;
		}
		result.push(count > 0 ? sum / count : 0);
	}
	return result;
}
