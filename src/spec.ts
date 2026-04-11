import type { AnsiColor } from "./types";

export type Charset = "braille" | "block" | "ascii" | "box";

export interface MarkDef {
	type: "line" | "bar" | "scatter" | "candlestick";
	key: string;
	color?: AnsiColor;
	label?: string;
}

export interface AxisDef {
	format?: "number" | "date" | ((v: number) => string);
}

export interface CandlestickKeysDef {
	open: string;
	high: string;
	low: string;
	close: string;
}

export interface ChartSpec {
	width: number | "auto";
	height: number | "auto";
	charset: Charset;
	data: Record<string, number>[];
	xKey: string;
	marks: MarkDef[];
	xAxis: AxisDef | null;
	yAxis: AxisDef | null;
	yDomain?: [number, number];
	_candlestickKeys?: CandlestickKeysDef;
}

export interface ChartBuilder {
	data(rows: Record<string, number>[], opts?: { xKey?: string }): ChartBuilder;
	line(opts: { key: string; color?: AnsiColor; label?: string }): ChartBuilder;
	bar(opts: { key: string; color?: AnsiColor; label?: string }): ChartBuilder;
	scatter(opts: { key: string; color?: AnsiColor; label?: string }): ChartBuilder;
	candlestick(opts: { open: string; high: string; low: string; close: string; color?: AnsiColor }): ChartBuilder;
	yDomain(domain: [number, number]): ChartBuilder;
	xAxis(opts?: AxisDef): ChartBuilder;
	yAxis(opts?: AxisDef): ChartBuilder;
	build(): ChartSpec;
}

export function chart(opts: { width?: number | "auto"; height?: number | "auto"; charset?: Charset } = {}): ChartBuilder {
	const spec: ChartSpec = {
		width: opts.width ?? "auto",
		height: opts.height ?? "auto",
		charset: opts.charset ?? "braille",
		data: [],
		xKey: "x",
		marks: [],
		xAxis: null,
		yAxis: null,
	};

	const builder: ChartBuilder = {
		data(rows, dataOpts) {
			spec.data = rows;
			if (dataOpts?.xKey) spec.xKey = dataOpts.xKey;
			return builder;
		},
		line(lineOpts) {
			spec.marks.push({ type: "line", ...lineOpts });
			return builder;
		},
		bar(barOpts) {
			spec.marks.push({ type: "bar", ...barOpts });
			return builder;
		},
		scatter(scatterOpts) {
			spec.marks.push({ type: "scatter", ...scatterOpts });
			return builder;
		},
		yDomain(domain) {
			spec.yDomain = domain;
			return builder;
		},
		candlestick(candleOpts) {
			spec.marks.push({ type: "candlestick", key: candleOpts.open, color: candleOpts.color });
			spec._candlestickKeys = {
				open: candleOpts.open,
				high: candleOpts.high,
				low: candleOpts.low,
				close: candleOpts.close,
			};
			return builder;
		},
		xAxis(axisOpts) {
			spec.xAxis = axisOpts ?? {};
			return builder;
		},
		yAxis(axisOpts) {
			spec.yAxis = axisOpts ?? {};
			return builder;
		},
		build() {
			return { ...spec, marks: [...spec.marks] };
		},
	};

	return builder;
}
