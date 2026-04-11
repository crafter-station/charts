import { ANSI_COLORS, ANSI_RESET, type AnsiColor } from "../types";

export interface HistogramOptions {
	bins?: number;
	width?: number;
	height?: number;
	color?: AnsiColor;
	showCounts?: boolean;
}

function computeBins(data: number[], numBins: number): { edges: number[]; counts: number[] } {
	const min = Math.min(...data);
	const max = Math.max(...data);
	const range = max - min || 1;
	const binWidth = range / numBins;

	const edges: number[] = [];
	const counts = new Array(numBins).fill(0) as number[];

	for (let i = 0; i <= numBins; i++) edges.push(min + i * binWidth);

	for (const v of data) {
		let bin = Math.floor((v - min) / binWidth);
		if (bin >= numBins) bin = numBins - 1;
		counts[bin]!++;
	}

	return { edges, counts };
}

const VERT_BLOCKS = [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

export function sparkHistogram(data: number[], options: HistogramOptions = {}): string {
	if (data.length === 0) return "";

	const bins = options.bins ?? 10;
	const width = options.width ?? 30;
	const height = options.height ?? 8;
	const fg = options.color ? ANSI_COLORS[options.color] : null;

	const { edges, counts } = computeBins(data, bins);
	const maxCount = Math.max(...counts, 1);

	const colsPerBin = Math.max(1, Math.floor(width / bins));
	const lines: string[] = [];

	for (let row = height - 1; row >= 0; row--) {
		let line = "";
		for (let b = 0; b < bins; b++) {
			const count = counts[b]!;
			const barHeight = (count / maxCount) * height;
			const fullRows = Math.floor(barHeight);
			const partial = barHeight - fullRows;

			let ch: string;
			if (row < fullRows) {
				ch = "█";
			} else if (row === fullRows && partial > 0.05) {
				const idx = Math.round(partial * (VERT_BLOCKS.length - 1));
				ch = VERT_BLOCKS[idx] ?? " ";
			} else {
				ch = " ";
			}
			line += ch.repeat(colsPerBin);
		}

		if (fg) lines.push(`${fg}${line}${ANSI_RESET}`);
		else lines.push(line);
	}

	const totalW = colsPerBin * bins;
	const minLabel = edges[0]!.toFixed(0);
	const maxLabel = edges[edges.length - 1]!.toFixed(0);
	const axis = minLabel + "─".repeat(Math.max(0, totalW - minLabel.length - maxLabel.length)) + maxLabel;
	lines.push(axis);

	if (options.showCounts) {
		lines.push(`n=${data.length} bins=${bins} max=${maxCount}`);
	}

	return lines.join("\n");
}
