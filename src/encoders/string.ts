import type { Grid } from "../grid";

export function encodeString(grid: Grid): string {
	const lines: string[] = [];

	for (let y = 0; y < grid.height; y++) {
		let line = "";
		for (let x = 0; x < grid.width; x++) {
			const cell = grid.get(x, y);
			line += cell?.char ?? " ";
		}
		lines.push(line.trimEnd());
	}

	while (lines.length > 0 && lines[lines.length - 1] === "") {
		lines.pop();
	}

	return lines.join("\n");
}
