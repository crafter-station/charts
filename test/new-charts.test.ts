import { describe, expect, it } from "bun:test";
import { sparkHeatmap, sparkHistogram, sparkGauge, sparkDonut } from "../src";

describe("sparkHeatmap", () => {
	it("renders a heatmap grid", () => {
		const data = [
			[0, 1, 2, 3],
			[1, 2, 3, 4],
			[2, 3, 4, 5],
		];
		const result = sparkHeatmap(data);
		const lines = result.split("\n");
		expect(lines.length).toBe(3);
		expect(result).toContain("█");
	});

	it("renders with labels", () => {
		const data = [[1, 5], [3, 2]];
		const result = sparkHeatmap(data, {
			labels: { rows: ["Mon", "Tue"], cols: ["AM", "PM"] },
		});
		expect(result).toContain("Mon");
		expect(result).toContain("AM");
	});

	it("renders with color", () => {
		const result = sparkHeatmap([[1, 2], [3, 4]], { color: "green" });
		expect(result).toContain("\x1b[32m");
	});

	it("handles empty", () => {
		expect(sparkHeatmap([])).toBe("");
	});

	it("is deterministic", () => {
		const data = [[1, 2, 3], [4, 5, 6]];
		expect(sparkHeatmap(data)).toBe(sparkHeatmap(data));
	});

	it("cellWidth: 1 produces one character per cell", () => {
		const data = [[0, 1, 2, 3, 4]];
		const result = sparkHeatmap(data, { cellWidth: 1 });
		expect(result.length).toBe(5);
	});

	it("cellWidth: 1 is exactly half the default width", () => {
		const data = [[1, 2, 3, 4]];
		const wide = sparkHeatmap(data);
		const narrow = sparkHeatmap(data, { cellWidth: 1 });
		expect(wide.length).toBe(narrow.length * 2);
	});

	it("zero option makes the minimum bucket visible instead of blank", () => {
		const data = [[0, 5]];
		const withBlank = sparkHeatmap(data, { cellWidth: 1 });
		const withShade = sparkHeatmap(data, { cellWidth: 1, zero: "░" });
		expect(withBlank[0]).toBe(" ");
		expect(withShade[0]).toBe("░");
	});

	it("zero option with all zeros renders fully textured", () => {
		const data = [[0, 0, 0, 0]];
		const result = sparkHeatmap(data, { cellWidth: 1, zero: "░" });
		expect(result).toBe("░░░░");
	});

	it("cellWidth and zero combine for single-row sparkline use case", () => {
		const data = [[0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0]];
		const result = sparkHeatmap(data, { cellWidth: 1, zero: "░" });
		expect(result.length).toBe(15);
		expect(result.includes(" ")).toBe(false);
		expect(result).toContain("█");
		expect(result).toContain("░");
	});
});

describe("sparkHistogram", () => {
	it("renders histogram", () => {
		const data = Array.from({ length: 100 }, () => Math.random() * 100);
		const result = sparkHistogram(data, { bins: 10, width: 30, height: 6 });
		const lines = result.split("\n");
		expect(lines.length).toBe(7);
		expect(result).toContain("█");
	});

	it("shows counts when requested", () => {
		const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const result = sparkHistogram(data, { showCounts: true });
		expect(result).toContain("n=10");
	});

	it("renders with color", () => {
		const result = sparkHistogram([1, 2, 3, 4, 5], { color: "blue" });
		expect(result).toContain("\x1b[34m");
	});

	it("handles empty", () => {
		expect(sparkHistogram([])).toBe("");
	});
});

describe("sparkGauge", () => {
	it("renders gauge bar", () => {
		const result = sparkGauge(75, 100);
		expect(result).toContain("█");
		expect(result).toContain("░");
		expect(result).toContain("75%");
	});

	it("auto-colors by threshold", () => {
		const low = sparkGauge(20, 100);
		const mid = sparkGauge(60, 100);
		const high = sparkGauge(90, 100);
		expect(low).toContain("\x1b[32m");
		expect(mid).toContain("\x1b[33m");
		expect(high).toContain("\x1b[31m");
	});

	it("renders with label", () => {
		const result = sparkGauge(50, 100, { label: "CPU" });
		expect(result).toContain("CPU");
	});

	it("clamps values", () => {
		const result = sparkGauge(150, 100);
		expect(result).toContain("100%");
	});
});

describe("sparkDonut", () => {
	it("renders donut dots", () => {
		const result = sparkDonut(75, 100);
		expect(result).toContain("●");
		expect(result).toContain("○");
		expect(result).toContain("75%");
	});

	it("renders with label", () => {
		const result = sparkDonut(50, 100, { label: "MEM" });
		expect(result).toContain("MEM");
	});
});
