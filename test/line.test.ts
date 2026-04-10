import { describe, expect, it } from "bun:test";
import { chart, renderToAnsi, renderToString } from "../src";

const sineData = Array.from({ length: 50 }, (_, i) => ({
	x: i,
	y: Math.sin(i / 5) * 50 + 50,
}));

describe("line chart", () => {
	it("renders a line chart to ANSI", () => {
		const c = chart({ width: 60, height: 15 })
			.data(sineData, { xKey: "x" })
			.yAxis()
			.line({ key: "y", color: "green" });

		const result = renderToAnsi(c);
		expect(result).toContain("\x1b[32m");
		expect(result.split("\n").length).toBe(15);
	});

	it("renders a line chart to deterministic string", () => {
		const c = chart({ width: 60, height: 15 })
			.data(sineData, { xKey: "x" })
			.yAxis()
			.line({ key: "y" });

		const result = renderToString(c);
		expect(result).not.toContain("\x1b[");
		expect(result.length).toBeGreaterThan(0);
	});

	it("deterministic string is stable across calls", () => {
		const c = chart({ width: 60, height: 15 })
			.data(sineData, { xKey: "x" })
			.yAxis()
			.line({ key: "y" });

		const r1 = renderToString(c);
		const r2 = renderToString(c);
		expect(r1).toBe(r2);
	});

	it("snapshot test", () => {
		const c = chart({ width: 40, height: 10 })
			.data(sineData, { xKey: "x" })
			.yAxis()
			.line({ key: "y" });

		expect(renderToString(c)).toMatchSnapshot();
	});

	it("handles empty data", () => {
		const c = chart({ width: 40, height: 10 })
			.data([], { xKey: "x" })
			.line({ key: "y" });

		const result = renderToString(c);
		expect(result).toBeDefined();
	});

	it("handles single data point", () => {
		const c = chart({ width: 40, height: 10 })
			.data([{ x: 0, y: 50 }], { xKey: "x" })
			.yAxis()
			.line({ key: "y" });

		const result = renderToString(c);
		expect(result.length).toBeGreaterThan(0);
	});

	it("y-axis shows labels", () => {
		const c = chart({ width: 60, height: 15 })
			.data(sineData, { xKey: "x" })
			.yAxis()
			.line({ key: "y" });

		const result = renderToString(c);
		expect(result).toMatch(/\d/);
		expect(result).toContain("┤");
	});

	it("y-axis supports custom format", () => {
		const c = chart({ width: 60, height: 15 })
			.data(sineData, { xKey: "x" })
			.yAxis({ format: (v) => `$${v.toFixed(0)}` })
			.line({ key: "y" });

		const result = renderToString(c);
		expect(result).toContain("$");
	});

	it("renders braille characters", () => {
		const c = chart({ width: 40, height: 10 })
			.data(sineData, { xKey: "x" })
			.line({ key: "y" });

		const result = renderToString(c);
		const hasBraille = /[\u2800-\u28FF]/.test(result);
		expect(hasBraille).toBe(true);
	});

	it("is reasonably fast (<10ms for 1000 points)", () => {
		const bigData = Array.from({ length: 1000 }, (_, i) => ({
			x: i,
			y: Math.sin(i / 50) * 100,
		}));
		const c = chart({ width: 80, height: 20 })
			.data(bigData, { xKey: "x" })
			.line({ key: "y" });

		const start = performance.now();
		renderToString(c);
		const elapsed = performance.now() - start;
		expect(elapsed).toBeLessThan(10);
	});
});
