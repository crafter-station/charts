import { describe, expect, it } from "bun:test";
import { chart, renderToAnsi, renderToString } from "../src";

const data = Array.from({ length: 30 }, (_, i) => ({
	x: i,
	price: Math.sin(i / 5) * 30 + 100,
	volume: Math.cos(i / 3) * 20 + 50,
}));

describe("multi-series + x-axis + legend", () => {
	it("renders two overlaid lines with different colors", () => {
		const c = chart({ width: 60, height: 12 })
			.data(data, { xKey: "x" })
			.yAxis()
			.line({ key: "price", color: "green", label: "Price" })
			.line({ key: "volume", color: "cyan", label: "Volume" });

		const result = renderToAnsi(c);
		expect(result).toContain("\x1b[32m");
		expect(result).toContain("\x1b[36m");
	});

	it("renders legend row with labels", () => {
		const c = chart({ width: 60, height: 12 })
			.data(data, { xKey: "x" })
			.yAxis()
			.line({ key: "price", color: "green", label: "Price" })
			.line({ key: "volume", color: "cyan", label: "Volume" });

		const result = renderToString(c);
		expect(result).toContain("Price");
		expect(result).toContain("Volume");
	});

	it("renders x-axis with ticks", () => {
		const c = chart({ width: 60, height: 12 })
			.data(data, { xKey: "x" })
			.xAxis()
			.yAxis()
			.line({ key: "price", color: "green" });

		const result = renderToString(c);
		expect(result).toContain("┴");
		expect(result).toContain("─");
	});

	it("x-axis supports custom format", () => {
		const c = chart({ width: 60, height: 12 })
			.data(data, { xKey: "x" })
			.xAxis({ format: (v) => `W${v.toFixed(0)}` })
			.yAxis()
			.line({ key: "price" });

		const result = renderToString(c);
		expect(result).toContain("W");
	});

	it("snapshot multi-series with legend + x-axis", () => {
		const c = chart({ width: 50, height: 10 })
			.data(data, { xKey: "x" })
			.xAxis()
			.yAxis()
			.line({ key: "price", color: "green", label: "Price" })
			.line({ key: "volume", color: "cyan", label: "Vol" });

		expect(renderToString(c)).toMatchSnapshot();
	});

	it("is deterministic", () => {
		const c = chart({ width: 50, height: 10 })
			.data(data, { xKey: "x" })
			.xAxis()
			.yAxis()
			.line({ key: "price", label: "P" })
			.line({ key: "volume", label: "V" });

		expect(renderToString(c)).toBe(renderToString(c));
	});
});
