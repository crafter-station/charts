import { describe, expect, it } from "bun:test";
import { chart, renderToAnsi, renderToString } from "../src";

const ohlcData = [
	{ d: 1, o: 100, h: 110, l: 95, c: 108 },
	{ d: 2, o: 108, h: 115, l: 105, c: 103 },
	{ d: 3, o: 103, h: 112, l: 100, c: 110 },
	{ d: 4, o: 110, h: 120, l: 108, c: 118 },
	{ d: 5, o: 118, h: 125, l: 112, c: 115 },
	{ d: 6, o: 115, h: 122, l: 110, c: 120 },
	{ d: 7, o: 120, h: 130, l: 118, c: 128 },
	{ d: 8, o: 128, h: 135, l: 122, c: 125 },
	{ d: 9, o: 125, h: 132, l: 120, c: 130 },
	{ d: 10, o: 130, h: 140, l: 128, c: 138 },
];

describe("candlestick chart", () => {
	it("renders candlestick to ANSI with green/red", () => {
		const c = chart({ width: 60, height: 14 })
			.data(ohlcData, { xKey: "d" })
			.yAxis()
			.candlestick({ open: "o", high: "h", low: "l", close: "c" });

		const result = renderToAnsi(c);
		expect(result).toContain("\x1b[32m");
		expect(result).toContain("█");
	});

	it("renders to deterministic string", () => {
		const c = chart({ width: 60, height: 14 })
			.data(ohlcData, { xKey: "d" })
			.yAxis()
			.candlestick({ open: "o", high: "h", low: "l", close: "c" });

		const r1 = renderToString(c);
		const r2 = renderToString(c);
		expect(r1).toBe(r2);
	});

	it("snapshot", () => {
		const c = chart({ width: 50, height: 12 })
			.data(ohlcData, { xKey: "d" })
			.yAxis()
			.candlestick({ open: "o", high: "h", low: "l", close: "c" });

		expect(renderToString(c)).toMatchSnapshot();
	});

	it("handles bullish and bearish candles", () => {
		const mixedData = [
			{ d: 1, o: 100, h: 110, l: 95, c: 108 },
			{ d: 2, o: 108, h: 115, l: 100, c: 102 },
		];
		const c = chart({ width: 30, height: 10 })
			.data(mixedData, { xKey: "d" })
			.candlestick({ open: "o", high: "h", low: "l", close: "c" });

		const result = renderToAnsi(c);
		expect(result).toContain("\x1b[32m");
		expect(result).toContain("\x1b[31m");
	});
});
