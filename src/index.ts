import { renderSparkline as _renderSparkline, renderSparklineString as _renderSparklineString } from "./marks/sparkline";
import { renderChartToAnsi, renderChartToString } from "./compile";
import { chart as _chart } from "./spec";
import type { SparklineOptions, AnsiColor } from "./types";
import type { ChartBuilder, ChartSpec, Charset } from "./spec";

export { type SparklineOptions, type AnsiColor, type ChartBuilder, type ChartSpec, type Charset };
export { _renderSparkline as renderSparkline, _renderSparklineString as renderSparklineString };
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
