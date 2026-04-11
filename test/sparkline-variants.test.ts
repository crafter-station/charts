import { describe, expect, it } from "bun:test";
import { sparkColumn, sparkBar, sparkWinLoss, sparkArea } from "../src";

describe("sparkColumn", () => {
	it("renders positive values", () => {
		const result = sparkColumn([1, 3, 5, 7, 9]);
		expect(result.length).toBe(5);
		expect(result).toContain("█");
	});

	it("renders negative values with different char", () => {
		const result = sparkColumn([5, -3, 7, -1, 4], { color: "blue", negColor: "red" });
		expect(result).toContain("\x1b[34m");
		expect(result).toContain("\x1b[31m");
	});

	it("handles all zeros", () => {
		const result = sparkColumn([0, 0, 0]);
		expect(result.length).toBe(3);
	});

	it("handles empty data", () => {
		expect(sparkColumn([])).toBe("");
	});

	it("handles width option", () => {
		const result = sparkColumn(Array.from({ length: 100 }, (_, i) => Math.sin(i)), { width: 20 });
		expect(result.replace(/\x1b\[[0-9;]*m/g, "").length).toBe(20);
	});
});

describe("sparkBar", () => {
	it("renders progress bar", () => {
		const result = sparkBar(75, 100, { width: 20 });
		expect(result).toContain("█");
		expect(result.replace(/\x1b\[[0-9;]*m/g, "").length).toBe(20);
	});

	it("renders with percentage", () => {
		const result = sparkBar(75, 100, { width: 20, showPercent: true });
		expect(result).toContain("75%");
	});

	it("renders 0%", () => {
		const result = sparkBar(0, 100, { width: 10, showPercent: true });
		expect(result).toContain("0%");
	});

	it("renders 100%", () => {
		const result = sparkBar(100, 100, { width: 10, showPercent: true });
		expect(result).toContain("100%");
	});

	it("clamps above max", () => {
		const result = sparkBar(150, 100, { width: 10, showPercent: true });
		expect(result).toContain("100%");
	});

	it("renders with color", () => {
		const result = sparkBar(50, 100, { width: 10, color: "green" });
		expect(result).toContain("\x1b[32m");
	});
});

describe("sparkWinLoss", () => {
	it("renders wins and losses", () => {
		const result = sparkWinLoss([1, -1, 1, 1, -1, -1, 1]);
		expect(result).toContain("▀");
		expect(result).toContain("▄");
	});

	it("uses green for wins, red for losses by default", () => {
		const result = sparkWinLoss([1, -1]);
		expect(result).toContain("\x1b[32m");
		expect(result).toContain("\x1b[31m");
	});

	it("supports custom colors", () => {
		const result = sparkWinLoss([1, -1], { winColor: "blue", lossColor: "yellow" });
		expect(result).toContain("\x1b[34m");
		expect(result).toContain("\x1b[33m");
	});

	it("handles empty", () => {
		expect(sparkWinLoss([])).toBe("");
	});
});

describe("sparkArea", () => {
	it("renders multi-line area chart", () => {
		const result = sparkArea([1, 5, 3, 7, 2, 8]);
		const lines = result.split("\n");
		expect(lines.length).toBe(3);
	});

	it("renders with color", () => {
		const result = sparkArea([1, 5, 3, 7], { color: "cyan" });
		expect(result).toContain("\x1b[36m");
	});

	it("handles width", () => {
		const result = sparkArea(Array.from({ length: 100 }, (_, i) => Math.sin(i) * 50 + 50), { width: 30 });
		const firstLine = result.split("\n")[0] ?? "";
		expect(firstLine.replace(/\x1b\[[0-9;]*m/g, "").length).toBe(30);
	});

	it("handles empty", () => {
		expect(sparkArea([])).toBe("");
	});

	it("is deterministic", () => {
		const data = [1, 5, 3, 7, 2, 8, 4, 6];
		expect(sparkArea(data)).toBe(sparkArea(data));
	});
});
