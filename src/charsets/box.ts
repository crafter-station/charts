export const BOX_SYMBOLS = {
	axis: "┼",
	tick: "┤",
	hLine: "─",
	vLine: "│",
	cornerBL: "╰",
	cornerTL: "╭",
	cornerTR: "╮",
	cornerBR: "╯",
} as const;

export function boxLineChar(y0: number, y1: number): { origin: string; dest: string; fill: string } {
	if (y0 === y1) return { origin: BOX_SYMBOLS.hLine, dest: BOX_SYMBOLS.hLine, fill: BOX_SYMBOLS.hLine };
	if (y0 > y1) return { origin: BOX_SYMBOLS.cornerTR, dest: BOX_SYMBOLS.cornerBL, fill: BOX_SYMBOLS.vLine };
	return { origin: BOX_SYMBOLS.cornerBR, dest: BOX_SYMBOLS.cornerTL, fill: BOX_SYMBOLS.vLine };
}
