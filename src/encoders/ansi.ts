import type { Grid } from "../grid";
import { ANSI_COLORS, ANSI_RESET, type AnsiColor } from "../types";

export function encodeAnsi(grid: Grid): string {
	const lines: string[] = [];

	for (let y = 0; y < grid.height; y++) {
		let line = "";
		let currentFg: string | null = null;

		for (let x = 0; x < grid.width; x++) {
			const cell = grid.get(x, y);
			if (!cell) continue;

			if (cell.fg !== currentFg) {
				if (currentFg !== null) line += ANSI_RESET;
				if (cell.fg !== null) line += ANSI_COLORS[cell.fg as AnsiColor] ?? "";
				currentFg = cell.fg;
			}
			line += cell.char;
		}

		if (currentFg !== null) line += ANSI_RESET;
		lines.push(line);
	}

	return lines.join("\n");
}
