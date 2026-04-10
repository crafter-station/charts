import { describe, expect, it } from "bun:test";
import { sparkline, renderSparklineString } from "../src";

describe("sparkline", () => {
	it("renders basic sparkline", () => {
		const result = sparkline([1, 5, 3, 7, 2, 8]);
		expect(result).toBe(" ▅▂▇▁█");
	});

	it("handles empty data", () => {
		expect(sparkline([])).toBe("");
	});

	it("handles single value", () => {
		const result = sparkline([5]);
		expect(result).toBe("▄");
	});

	it("handles all same values", () => {
		const result = sparkline([3, 3, 3, 3]);
		expect(result).toBe("▄▄▄▄");
	});

	it("handles min = 0, max = 0", () => {
		const result = sparkline([0, 0, 0]);
		expect(result).toBe("▄▄▄");
	});

	it("respects custom min/max", () => {
		const result = sparkline([5, 5, 5], { min: 0, max: 10 });
		expect(result).toBe("▄▄▄");
	});

	it("renders full range correctly", () => {
		const result = sparkline([0, 1], { min: 0, max: 1 });
		expect(result).toBe(" █");
	});

	it("downsamples when width is smaller than data", () => {
		const data = Array.from({ length: 100 }, (_, i) => Math.sin(i / 10) * 50 + 50);
		const result = sparkline(data, { width: 20 });
		expect(result.length).toBe(20);
	});

	it("does not upsample when width is larger", () => {
		const result = sparkline([1, 5, 3], { width: 10 });
		expect(result.length).toBe(3);
	});

	it("renderSparklineString strips color", () => {
		const withColor = sparkline([1, 5, 8], { color: "green" });
		const plain = renderSparklineString([1, 5, 8]);
		expect(withColor).toContain("\x1b[32m");
		expect(plain).not.toContain("\x1b[");
	});

	it("is deterministic (snapshot)", () => {
		const result = renderSparklineString([0, 2, 4, 6, 8, 10, 8, 6, 4, 2, 0]);
		expect(result).toMatchSnapshot();
	});

	it("is fast (<1ms for 120 points)", () => {
		const data = Array.from({ length: 120 }, (_, i) => Math.sin(i / 10));
		const start = performance.now();
		for (let i = 0; i < 100; i++) sparkline(data);
		const elapsed = (performance.now() - start) / 100;
		expect(elapsed).toBeLessThan(1);
	});
});
