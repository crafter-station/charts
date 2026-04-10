import type { Grid } from "../grid";
import type { Scale } from "../scale";

export interface CandlestickKeys {
	open: string;
	high: string;
	low: string;
	close: string;
}

export function renderCandlestick(
	grid: Grid,
	data: Record<string, number>[],
	keys: CandlestickKeys,
	yScale: Scale,
	plotArea: { x: number; y: number; w: number; h: number },
): void {
	if (data.length === 0) return;

	const gap = 1;
	const totalGaps = data.length - 1;
	const availWidth = plotArea.w - totalGaps;
	const candleWidth = Math.max(1, Math.floor(availWidth / data.length));
	const wickX = Math.floor(candleWidth / 2);

	for (let i = 0; i < data.length; i++) {
		const row = data[i];
		if (!row) continue;

		const o = row[keys.open];
		const h = row[keys.high];
		const l = row[keys.low];
		const c = row[keys.close];
		if (o === undefined || h === undefined || l === undefined || c === undefined) continue;

		const bullish = c >= o;
		const fg = bullish ? "green" : "red";

		const baseX = plotArea.x + i * (candleWidth + gap);

		const highRow = plotArea.y + plotArea.h - 1 - yScale.map(h);
		const lowRow = plotArea.y + plotArea.h - 1 - yScale.map(l);
		const openRow = plotArea.y + plotArea.h - 1 - yScale.map(o);
		const closeRow = plotArea.y + plotArea.h - 1 - yScale.map(c);

		const bodyTop = Math.min(openRow, closeRow);
		const bodyBottom = Math.max(openRow, closeRow);

		for (let y = highRow; y <= lowRow; y++) {
			if (y >= bodyTop && y <= bodyBottom) {
				for (let x = baseX; x < baseX + candleWidth && x < plotArea.x + plotArea.w; x++) {
					grid.set(x, y, "█", fg);
				}
			} else {
				const wx = baseX + wickX;
				if (wx < plotArea.x + plotArea.w) {
					grid.set(wx, y, "│", fg);
				}
			}
		}
	}
}
