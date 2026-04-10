import { describe, expect, it } from "bun:test";
import { chart, renderToAnsi, renderToString } from "../src";

const scatterData = Array.from({ length: 50 }, (_, i) => ({
	x: Math.random() * 100,
	y: Math.random() * 100,
}));

describe("scatter chart", () => {
	it("renders scatter in braille (default)", () => {
		const c = chart({ width: 50, height: 12 })
			.data(scatterData, { xKey: "x" })
			.yAxis()
			.scatter({ key: "y", color: "magenta" });

		const result = renderToAnsi(c);
		expect(result).toContain("\x1b[35m");
		expect(/[\u2800-\u28FF]/.test(result)).toBe(true);
	});

	it("renders scatter in ascii mode", () => {
		const c = chart({ width: 50, height: 12, charset: "ascii" })
			.data(scatterData, { xKey: "x" })
			.yAxis()
			.scatter({ key: "y", color: "yellow" });

		const result = renderToString(c);
		expect(result).toContain("*");
	});

	it("renders scatter in block mode", () => {
		const c = chart({ width: 50, height: 12, charset: "block" })
			.data(scatterData, { xKey: "x" })
			.yAxis()
			.scatter({ key: "y" });

		const result = renderToString(c);
		expect(result).toContain("●");
	});

	it("braille has more dots than ascii for same data", () => {
		const fixed = Array.from({ length: 30 }, (_, i) => ({
			x: i * 3,
			y: Math.sin(i / 3) * 40 + 50,
		}));

		const braille = renderToString(
			chart({ width: 40, height: 10 }).data(fixed, { xKey: "x" }).scatter({ key: "y" }),
		);
		const ascii = renderToString(
			chart({ width: 40, height: 10, charset: "ascii" }).data(fixed, { xKey: "x" }).scatter({ key: "y" }),
		);

		const brailleNonSpace = braille.replace(/[\s\u2800│┤]/g, "").length;
		const asciiNonSpace = ascii.replace(/[\s│┤]/g, "").length;
		expect(brailleNonSpace).toBeGreaterThanOrEqual(asciiNonSpace);
	});

	it("is deterministic", () => {
		const fixed = Array.from({ length: 20 }, (_, i) => ({ x: i, y: i * 2 }));
		const c = chart({ width: 40, height: 10 })
			.data(fixed, { xKey: "x" })
			.scatter({ key: "y" });

		expect(renderToString(c)).toBe(renderToString(c));
	});
});
