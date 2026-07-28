export const BLOCK_CHARS = [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"] as const;

export function blockChar(value: number, min: number, max: number): string {
	if (max === min) return BLOCK_CHARS[4]!;
	const normalized = (value - min) / (max - min);
	const index = Math.round(normalized * (BLOCK_CHARS.length - 1));
	// Floor at 1, not 0. BLOCK_CHARS[0] is a space, so the minimum of a series
	// would render as blank and read as missing data rather than a low value.
	// `bar.ts` already floors at 1 for the same reason.
	return BLOCK_CHARS[Math.max(1, Math.min(index, BLOCK_CHARS.length - 1))]!;
}
