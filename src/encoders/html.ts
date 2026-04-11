import type { Grid } from "../grid";
import { ANSI_COLORS, type AnsiColor } from "../types";

const COLOR_TO_CSS: Record<string, string> = {
	red: "#ef4444",
	green: "#22c55e",
	yellow: "#eab308",
	blue: "#3b82f6",
	magenta: "#d946ef",
	cyan: "#06b6d4",
	white: "#e8e0d4",
	gray: "#6b7c72",
};

export function encodeHtml(grid: Grid): string {
	const lines: string[] = [];

	for (let y = 0; y < grid.height; y++) {
		let line = "";
		let currentFg: string | null = null;

		for (let x = 0; x < grid.width; x++) {
			const cell = grid.get(x, y);
			if (!cell) continue;

			if (cell.fg !== currentFg) {
				if (currentFg !== null) line += "</span>";
				if (cell.fg !== null) {
					const css = COLOR_TO_CSS[cell.fg] ?? cell.fg;
					line += `<span style="color:${css}">`;
				}
				currentFg = cell.fg;
			}

			const ch = cell.char;
			if (ch === "<") line += "&lt;";
			else if (ch === ">") line += "&gt;";
			else if (ch === "&") line += "&amp;";
			else line += ch;
		}

		if (currentFg !== null) line += "</span>";
		lines.push(line);
	}

	return lines.join("\n");
}
