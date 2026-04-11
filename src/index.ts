import { renderSparkline as _renderSparkline, renderSparklineString as _renderSparklineString, renderSparklineHtml as _renderSparklineHtml } from "./marks/sparkline";
import { sparkColumn, sparkBar, sparkWinLoss, sparkArea } from "./marks/sparkline-variants";
import type { ColumnSparklineOptions, BarSparklineOptions, WinLossOptions, AreaSparklineOptions } from "./marks/sparkline-variants";
import { sparkHeatmap } from "./marks/heatmap";
import type { HeatmapOptions } from "./marks/heatmap";
import { sparkHistogram } from "./marks/histogram";
import type { HistogramOptions } from "./marks/histogram";
import { sparkGauge, sparkDonut } from "./marks/gauge";
import type { GaugeOptions } from "./marks/gauge";
import { renderChartToAnsi, renderChartToString, renderChartToHtml } from "./compile";
import { chart as _chart } from "./spec";
import type { SparklineOptions, AnsiColor } from "./types";
import type { ChartBuilder, ChartSpec, Charset } from "./spec";

export { type SparklineOptions, type AnsiColor, type ChartBuilder, type ChartSpec, type Charset };
export { type ColumnSparklineOptions, type BarSparklineOptions, type WinLossOptions, type AreaSparklineOptions };
export { sparkColumn, sparkBar, sparkWinLoss, sparkArea };
export { sparkHeatmap, type HeatmapOptions };
export { sparkHistogram, type HistogramOptions };
export { sparkGauge, sparkDonut, type GaugeOptions };
export { _renderSparkline as renderSparkline, _renderSparklineString as renderSparklineString, _renderSparklineHtml as renderSparklineHtml };
export { _chart as chart };

export function sparkline(data: number[], options?: SparklineOptions): string {
	return _renderSparkline(data, options);
}

export function renderToAnsi(builder: ChartBuilder): string {
	return renderChartToAnsi(builder.build());
}

export function renderToString(builder: ChartBuilder): string {
	return renderChartToString(builder.build());
}

export function renderToHtml(builder: ChartBuilder): string {
	return renderChartToHtml(builder.build());
}

export interface PlotOptions {
	width?: number;
	height?: number;
	min?: number;
	max?: number;
	color?: AnsiColor;
	charset?: Charset;
}

export function plot(data: number[] | number[][], options: PlotOptions = {}): string {
	const series = Array.isArray(data[0]) ? (data as number[][]) : [data as number[]];
	const colors: AnsiColor[] = ["cyan", "green", "yellow", "magenta", "red", "blue", "white", "gray"];

	const maxLen = Math.max(...series.map((s) => s.length));
	const rows: Record<string, number>[] = [];
	for (let i = 0; i < maxLen; i++) {
		const row: Record<string, number> = { _x: i };
		for (let s = 0; s < series.length; s++) {
			const val = series[s]?.[i];
			if (val !== undefined) row[`s${s}`] = val;
		}
		rows.push(row);
	}

	let c = _chart({
		width: options.width,
		height: options.height,
		charset: options.charset ?? "braille",
	}).data(rows, { xKey: "_x" }).yAxis();

	if (options.min !== undefined || options.max !== undefined) {
		const allVals = series.flat().filter((v) => v !== undefined) as number[];
		const lo = options.min ?? Math.min(...allVals);
		const hi = options.max ?? Math.max(...allVals);
		c = c.yDomain([lo, hi]);
	}

	for (let s = 0; s < series.length; s++) {
		c = c.line({ key: `s${s}`, color: options.color ?? colors[s % colors.length]! });
	}

	return renderChartToAnsi(c.build());
}
