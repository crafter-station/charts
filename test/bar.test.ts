import { describe, expect, it } from "bun:test";
import { chart, renderToAnsi, renderToString } from "../src";

const salesData = [
	{ month: 1, revenue: 120 },
	{ month: 2, revenue: 250 },
	{ month: 3, revenue: 180 },
	{ month: 4, revenue: 400 },
	{ month: 5, revenue: 320 },
	{ month: 6, revenue: 500 },
];

describe("bar chart", () => {
	it("renders vertical bars to ANSI", () => {
		const c = chart({ width: 50, height: 12 })
			.data(salesData, { xKey: "month" })
			.yAxis()
			.bar({ key: "revenue", color: "blue" });

		const result = renderToAnsi(c);
		expect(result).toContain("\x1b[34m");
		expect(result).toContain("█");
	});

	it("renders vertical bars to deterministic string", () => {
		const c = chart({ width: 50, height: 12 })
			.data(salesData, { xKey: "month" })
			.yAxis()
			.bar({ key: "revenue" });

		const r1 = renderToString(c);
		const r2 = renderToString(c);
		expect(r1).toBe(r2);
		expect(r1).toContain("█");
	});

	it("snapshot", () => {
		const c = chart({ width: 40, height: 10 })
			.data(salesData, { xKey: "month" })
			.yAxis()
			.bar({ key: "revenue" });

		expect(renderToString(c)).toMatchSnapshot();
	});

	it("handles empty data", () => {
		const c = chart({ width: 40, height: 10 })
			.data([], { xKey: "month" })
			.bar({ key: "revenue" });

		const result = renderToString(c);
		expect(result).toBeDefined();
	});
});
