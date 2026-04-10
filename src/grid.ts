export interface Cell {
	char: string;
	fg: string | null;
	bg: string | null;
}

export interface Grid {
	width: number;
	height: number;
	cells: Cell[][];
	set(x: number, y: number, char: string, fg?: string | null): void;
	get(x: number, y: number): Cell | undefined;
}

export function createGrid(width: number, height: number): Grid {
	const cells: Cell[][] = [];
	for (let y = 0; y < height; y++) {
		const row: Cell[] = [];
		for (let x = 0; x < width; x++) {
			row.push({ char: " ", fg: null, bg: null });
		}
		cells.push(row);
	}

	return {
		width,
		height,
		cells,
		set(x: number, y: number, char: string, fg?: string | null) {
			if (x < 0 || x >= width || y < 0 || y >= height) return;
			const cell = cells[y]?.[x];
			if (!cell) return;
			cell.char = char;
			if (fg !== undefined) cell.fg = fg ?? null;
		},
		get(x: number, y: number) {
			return cells[y]?.[x];
		},
	};
}

export function detectWidth(): number {
	if (typeof process !== "undefined" && process.stdout?.columns) {
		return process.stdout.columns;
	}
	return 80;
}
