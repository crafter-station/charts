import { ANSI_COLORS, ANSI_RESET, type AnsiColor } from "../types";

export interface HistogramOptions {
	bins?: number;
	width?: number;
	height?: number;
	color?: AnsiColor;
	showCounts?: boolean;
	/**
	 * Background character for empty cells. Defaults to " " (space).
	 * Pass "░" for a visible textured background that distinguishes the plot
	 * area from the surrounding terminal and prevents visual "holes" when
	 * short bars sit next to tall ones.
	 */
	background?: string;
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

/**
 * Render a histogram where every filled cell is a solid `█` block — no
 * fractional glyphs that leave transparent pixels. We pick the bar height
 * per bin by rounding to a whole row, so the chart reads as a clean stepped
 * silhouette without any visual holes.
 *
 * The tradeoff: height is discrete. A `height: 8` histogram has exactly 8
 * possible bar heights. That's fine for typical displays — the resolution
 * is plenty to distinguish a bell curve from a uniform distribution.
 */
export function sparkHistogram(data: number[], options: HistogramOptions = {}): string {
	if (data.length === 0) return "";

	const bins = options.bins ?? 10;
	const width = options.width ?? 30;
	const height = options.height ?? 8;
	const fg = options.color ? ANSI_COLORS[options.color] : null;
	const background = options.background ?? " ";

	const { edges, counts } = computeBins(data, bins);
	const maxCount = Math.max(...counts, 1);

	const colsPerBin = Math.max(1, Math.floor(width / bins));
	const lines: string[] = [];

	// Pre-compute bar heights as whole rows so every cell is either fully
	// filled or fully empty — no fractional blocks that leave negative space.
	const barHeights = counts.map(c => {
		if (c === 0) return 0;
		// Always show at least 1 row for any bin with data, so non-empty
		// tails remain visible instead of disappearing into the axis.
		return Math.max(1, Math.round((c / maxCount) * height));
	});

	for (let row = height - 1; row >= 0; row--) {
		let line = "";
		for (let b = 0; b < bins; b++) {
			const barHeight = barHeights[b]!;
			// row 0 is the bottom, so fill when row < barHeight
			const ch = row < barHeight ? "█" : background;
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
