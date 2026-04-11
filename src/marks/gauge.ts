import { ANSI_COLORS, ANSI_RESET, type AnsiColor } from "../types";

export interface GaugeOptions {
	width?: number;
	color?: AnsiColor;
	label?: string;
	showPercent?: boolean;
}

export function sparkGauge(value: number, max: number, options: GaugeOptions = {}): string {
	const width = options.width ?? 20;
	const ratio = Math.max(0, Math.min(1, value / max));
	const filled = Math.round(ratio * width);
	const empty = width - filled;

	const fg = options.color ? ANSI_COLORS[options.color] : null;
	const autoColor = ratio >= 0.8 ? ANSI_COLORS.red : ratio >= 0.5 ? ANSI_COLORS.yellow : ANSI_COLORS.green;
	const color = fg ?? autoColor;

	const bar = `${color}${"█".repeat(filled)}${ANSI_RESET}${"░".repeat(empty)}`;
	const pct = options.showPercent !== false ? ` ${Math.round(ratio * 100)}%` : "";
	const label = options.label ? `${options.label} ` : "";

	return `${label}${bar}${pct}`;
}

export function sparkDonut(value: number, max: number, options: GaugeOptions = {}): string {
	const ratio = Math.max(0, Math.min(1, value / max));
	const segments = 8;
	const filled = Math.round(ratio * segments);

	const FULL = "●";
	const EMPTY = "○";

	const fg = options.color ? ANSI_COLORS[options.color] : null;
	const autoColor = ratio >= 0.8 ? ANSI_COLORS.red : ratio >= 0.5 ? ANSI_COLORS.yellow : ANSI_COLORS.green;
	const color = fg ?? autoColor;

	const dots = `${color}${FULL.repeat(filled)}${ANSI_RESET}${EMPTY.repeat(segments - filled)}`;
	const pct = options.showPercent !== false ? ` ${Math.round(ratio * 100)}%` : "";
	const label = options.label ? `${options.label} ` : "";

	return `${label}${dots}${pct}`;
}
