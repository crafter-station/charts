export const BLOCK_CHARS = [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"] as const;

export function blockChar(value: number, min: number, max: number): string {
	if (max === min) return BLOCK_CHARS[4]!;
	const normalized = (value - min) / (max - min);
	const index = Math.round(normalized * (BLOCK_CHARS.length - 1));
	return BLOCK_CHARS[Math.max(0, Math.min(index, BLOCK_CHARS.length - 1))]!;
}
