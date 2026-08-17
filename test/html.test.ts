import { describe, expect, it } from "bun:test";
import { chart, renderToHtml } from "../src";

const sineData = Array.from({ length: 50 }, (_, i) => ({
	x: i,
	y: Math.sin(i / 5) * 50 + 50,
}));

const salesData = [
	{ month: 1, revenue: 120 },
	{ month: 2, revenue: 250 },
	{ month: 3, revenue: 180 },
	{ month: 4, revenue: 400 },
	{ month: 5, revenue: 320 },
	{ month: 6, revenue: 500 },
];

describe("renderToHtml", () => {
	it("renders a line chart with HTML color spans", () => {
		const c = chart({ width: 60, height: 15 })
			.data(sineData, { xKey: "x" })
			.yAxis()
			.line({ key: "y", color: "green" });

		const result = renderToHtml(c);
		expect(result.length).toBeGreaterThan(0);
		expect(result).toContain('<span style="color:');
		expect(result).toContain("</span>");
		expect(result).not.toContain("\x1b[");
		expect(result.split("\n").length).toBe(15);
	});

	it("line chart HTML is deterministic across calls", () => {
		const c = chart({ width: 60, height: 15 })
			.data(sineData, { xKey: "x" })
			.yAxis()
			.line({ key: "y", color: "green" });

		const r1 = renderToHtml(c);
		const r2 = renderToHtml(c);
		expect(r1).toBe(r2);
	});

	it("line chart snapshot", () => {
		const c = chart({ width: 40, height: 10 })
			.data(sineData, { xKey: "x" })
			.yAxis()
			.line({ key: "y", color: "green" });

		expect(renderToHtml(c)).toMatchSnapshot();
	});

	it("renders a bar chart with HTML color spans", () => {
		const c = chart({ width: 50, height: 12 })
			.data(salesData, { xKey: "month" })
			.yAxis()
			.bar({ key: "revenue", color: "blue" });

		const result = renderToHtml(c);
		expect(result.length).toBeGreaterThan(0);
		expect(result).toContain('<span style="color:');
		expect(result).toContain("</span>");
		expect(result).not.toContain("\x1b[");
		expect(result).toContain("█");
	});

	it("bar chart HTML is deterministic across calls", () => {
		const c = chart({ width: 50, height: 12 })
			.data(salesData, { xKey: "month" })
			.yAxis()
			.bar({ key: "revenue", color: "blue" });

		const r1 = renderToHtml(c);
		const r2 = renderToHtml(c);
		expect(r1).toBe(r2);
	});

	it("bar chart snapshot", () => {
		const c = chart({ width: 40, height: 10 })
			.data(salesData, { xKey: "month" })
			.yAxis()
			.bar({ key: "revenue", color: "blue" });

		expect(renderToHtml(c)).toMatchSnapshot();
	});

	it("identical builders produce byte-identical HTML", () => {
		const build = () =>
			chart({ width: 40, height: 10 })
				.data(sineData, { xKey: "x" })
				.yAxis()
				.line({ key: "y", color: "cyan" });

		expect(renderToHtml(build())).toBe(renderToHtml(build()));
	});

	it("HTML output respects chart width", () => {
		const narrow = renderToHtml(
			chart({ width: 30, height: 8 })
				.data(sineData, { xKey: "x" })
				.yAxis()
				.line({ key: "y", color: "green" }),
		);
		const wide = renderToHtml(
			chart({ width: 60, height: 8 })
				.data(sineData, { xKey: "x" })
				.yAxis()
				.line({ key: "y", color: "green" }),
		);

		expect(narrow).not.toBe(wide);
		expect(wide.length).toBeGreaterThan(narrow.length);
		expect(narrow.split("\n").length).toBe(8);
		expect(wide.split("\n").length).toBe(8);
	});
});
