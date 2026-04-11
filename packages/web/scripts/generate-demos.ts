#!/usr/bin/env bun
/**
 * Regenerate the demos.json used by the landing page from the current charts
 * library. Run this after bumping @crafter/charts to a new version or after
 * fixing a rendering bug so the landing reflects the latest output.
 *
 * Usage:
 *   cd packages/web
 *   bun scripts/generate-demos.ts
 *
 * Output: src/data/demos.json
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	sparkline,
	renderSparklineHtml,
	sparkColumn,
	sparkBar,
	sparkWinLoss,
	sparkArea,
	sparkHeatmap,
	sparkHistogram,
	sparkGauge,
	sparkDonut,
	chart,
	renderToHtml,
	plot,
} from "../../../src/index";

// ─── helpers ───────────────────────────────────────────────────────

function stripAnsiAndWrap(raw: string, color?: string): string {
	const stripped = raw.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
	if (!color) return stripped;
	return `<span style="color:${color}">${stripped}</span>`;
}

/**
 * Convert a multi-line ANSI string produced by the library into an HTML string
 * that wraps each run of same-colored text in a span. The landing renders
 * everything with `set:html` inside <pre>, so we just need plain HTML spans.
 */
function ansiToHtml(raw: string): string {
	const ANSI_RE = /\x1b\[([0-9;]*)m/g;
	const COLOR_MAP: Record<string, string> = {
		"31": "#ef4444",
		"32": "#22c55e",
		"33": "#eab308",
		"34": "#3b82f6",
		"35": "#d946ef",
		"36": "#06b6d4",
		"37": "#e8e0d4",
		"90": "#6b7c72",
	};

	let out = "";
	let current: string | null = null;
	let lastIdx = 0;
	let match: RegExpExecArray | null;

	while ((match = ANSI_RE.exec(raw)) !== null) {
		// Emit anything between the last escape and this one, with current color.
		const segment = raw.slice(lastIdx, match.index);
		if (segment) {
			if (current) out += `<span style="color:${current}">${escapeHtml(segment)}</span>`;
			else out += escapeHtml(segment);
		}

		const code = match[1]!;
		if (code === "0" || code === "") {
			current = null;
		} else {
			current = COLOR_MAP[code] ?? null;
		}
		lastIdx = match.index + match[0].length;
	}

	// Tail
	const tail = raw.slice(lastIdx);
	if (tail) {
		if (current) out += `<span style="color:${current}">${escapeHtml(tail)}</span>`;
		else out += escapeHtml(tail);
	}

	return out;
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Deterministic pseudo-random for data so demos are stable across runs.
function seededRandom(seed: number): () => number {
	let s = seed;
	return () => {
		s = (s * 1103515245 + 12345) & 0x7fffffff;
		return s / 0x7fffffff;
	};
}

// ─── sparklines ────────────────────────────────────────────────────

function makeSparklines() {
	const cpu = [20, 30, 40, 55, 70, 85, 95, 95, 90, 75, 60, 45, 30, 15, 0, 0, 0, 10, 20, 35, 50];
	const mem = [20, 25, 30, 32, 38, 42, 45, 48, 50, 55, 58, 62, 65, 68, 72, 75, 78, 85, 92, 98];
	const stock = [50, 52, 55, 58, 60, 62, 64, 66, 68, 68, 68, 68, 70, 72, 74, 76, 80, 85, 90, 95];
	const errors = [0, 2, 2, 2, 2, 0, 1, 0, 0, 40, 60, 45, 2, 2, 2, 2, 1, 0, 2, 2];
	const example = [60, 75, 80, 90, 95, 95, 92, 88, 82, 70, 55, 40, 30, 25, 20, 15, 8, 5, 0, 0, 0, 5, 10, 15, 25, 40, 55, 60, 65, 70, 72, 70, 68, 65, 60, 55];

	return {
		sparklineCpu: renderSparklineHtml(cpu, { color: "cyan" }),
		sparklineMemory: renderSparklineHtml(mem, { color: "green" }),
		sparklineStock: renderSparklineHtml(stock, { color: "yellow" }),
		sparklineErrors: renderSparklineHtml(errors, { color: "red" }),
		sparklineExample: renderSparklineHtml(example, { color: "yellow" }),
	};
}

// ─── line chart demos ──────────────────────────────────────────────

function makeLineCharts() {
	// Sine
	const sinePoints = Array.from({ length: 40 }, (_, i) => ({
		x: i,
		y: 50 + Math.sin(i / 6) * 35,
	}));

	const sineSpec = chart({ width: 60, height: 14 })
		.data(sinePoints, { xKey: "x" })
		.line({ key: "y", color: "cyan" })
		.xAxis()
		.yAxis()
		.build();
	const lineSine = ansiToHtml(stripColumnTrailingSpace(require("../../../src/compile").renderChartToAnsi(sineSpec)));

	// Multi-series
	const multiPoints = Array.from({ length: 30 }, (_, i) => ({
		x: i,
		price: 80 + Math.sin(i / 4) * 40 + 20,
		volume: 60 + Math.cos(i / 5) * 25,
	}));
	const multiSpec = chart({ width: 62, height: 13 })
		.data(multiPoints, { xKey: "x" })
		.line({ key: "price", color: "green", label: "Price" })
		.line({ key: "volume", color: "cyan", label: "Volume" })
		.xAxis()
		.yAxis()
		.build();
	const multiSeries = ansiToHtml(stripColumnTrailingSpace(require("../../../src/compile").renderChartToAnsi(multiSpec)));

	// Hero
	const heroPoints = Array.from({ length: 30 }, (_, i) => ({
		x: i,
		y: 50 + Math.sin(i / 4) * 30,
	}));
	const heroSpec = chart({ width: 40, height: 10 })
		.data(heroPoints, { xKey: "x" })
		.line({ key: "y", color: "cyan" })
		.yAxis()
		.build();
	const heroChart = ansiToHtml(stripColumnTrailingSpace(require("../../../src/compile").renderChartToAnsi(heroSpec)));

	return { lineSine, multiSeries, heroChart };
}

function stripColumnTrailingSpace(s: string): string {
	return s
		.split("\n")
		.map(l => l.replace(/\s+$/, ""))
		.join("\n");
}

// ─── bar / scatter / candlestick ───────────────────────────────────

function makeBarCandle() {
	const barData = Array.from({ length: 8 }, (_, i) => ({
		month: i,
		revenue: [180, 0, 290, 0, 430, 380, 500, 370][i],
	}));
	const barSpec = chart({ width: 60, height: 11 })
		.data(barData.filter(d => d.revenue > 0), { xKey: "month" })
		.bar({ key: "revenue", color: "blue" })
		.yAxis()
		.build();
	const barRevenue = ansiToHtml(stripColumnTrailingSpace(require("../../../src/compile").renderChartToAnsi(barSpec)));

	// Scatter
	const scatterPoints = [];
	const rng = seededRandom(42);
	for (let i = 0; i < 30; i++) {
		scatterPoints.push({ x: i, y: 30 + rng() * 70 });
	}
	const scatterSpec = chart({ width: 60, height: 10 })
		.data(scatterPoints, { xKey: "x" })
		.scatter({ key: "y", color: "magenta" })
		.yAxis()
		.build();
	const scatterBraille = ansiToHtml(stripColumnTrailingSpace(require("../../../src/compile").renderChartToAnsi(scatterSpec)));

	// Candlestick
	const candleData = Array.from({ length: 10 }, (_, i) => {
		const base = 110 + i * 2;
		return { day: i, open: base, high: base + 5, low: base - 3, close: base + (i % 2 === 0 ? 3 : -2) };
	});
	const candleSpec = chart({ width: 60, height: 12 })
		.data(candleData, { xKey: "day" })
		.candlestick({ open: "open", high: "high", low: "low", close: "close" })
		.yAxis()
		.build();
	const candlestick = ansiToHtml(stripColumnTrailingSpace(require("../../../src/compile").renderChartToAnsi(candleSpec)));

	return { barRevenue, scatterBraille, candlestick };
}

// ─── heatmap / histogram / gauge ───────────────────────────────────

function makeNewCharts() {
	// Weekly activity heatmap (4 weeks × 7 days)
	const rng = seededRandom(7);
	const weeks: number[][] = [];
	for (let w = 0; w < 4; w++) {
		const row: number[] = [];
		for (let d = 0; d < 7; d++) {
			// Mid-week peaks
			const mid = d === 2 || d === 3 ? 4 : d === 0 || d === 6 ? 1 : 2;
			row.push(Math.max(0, mid + Math.floor(rng() * 3) - 1));
		}
		weeks.push(row);
	}
	const heatmap = ansiToHtml(
		sparkHeatmap(weeks, {
			labels: { rows: ["W1", "W2", "W3", "W4"], cols: ["M", "T", "W", "T", "F", "S", "S"] },
			color: "cyan",
		}),
	);

	// Histogram — the one that used to be horrible. Now fixed.
	const histogramRng = seededRandom(123);
	const normalData: number[] = [];
	for (let i = 0; i < 500; i++) {
		// Box-Muller → approximate gaussian
		const u1 = histogramRng();
		const u2 = histogramRng();
		const z = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2);
		normalData.push(50 + z * 15);
	}
	const histogram = ansiToHtml(
		sparkHistogram(normalData, { bins: 15, width: 45, height: 8, color: "yellow", background: "░" }),
	);

	// Gauges row
	const gaugeLines = [
		sparkGauge(0.23, { label: "CPU ", width: 20 }),
		sparkGauge(0.67, { label: "MEM ", width: 20 }),
		sparkGauge(0.91, { label: "DISK", width: 20 }),
		"",
		sparkDonut(0.23, { label: "CPU " }),
		sparkDonut(0.67, { label: "MEM " }),
		sparkDonut(0.91, { label: "DISK" }),
	];
	const gauges = ansiToHtml(gaugeLines.join("\n"));

	return { heatmap, histogram, gauges };
}

// ─── sparkline variants ────────────────────────────────────────────

function makeVariants() {
	const colData = [3, 6, 7, 8, 8, 8, 8, 6, 5, 5, 7, 8, 8, 8, 8, 7, 5, 3, 6, 7, 8, 8, 8];
	const varColumn = sparkColumn(colData);

	const winLossData = [1, -1, 1, 1, -1, 1, -1, -1, 1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, -1, 1];
	const varWinLoss = ansiToHtml(sparkWinLoss(winLossData, { color: "green" }));

	const varBar90 = `<span style="color:#22c55e">${sparkBar(0.9, { width: 20 }).replace(/\s+\d+%$/, "")}</span> 90%`;
	const varBar45 = `<span style="color:#eab308">${sparkBar(0.45, { width: 20 }).replace(/\s+\d+%$/, "")}</span> 45%`;
	const varBar15 = `<span style="color:#ef4444">${sparkBar(0.15, { width: 20 }).replace(/\s+\d+%$/, "")}</span> 15%`;

	// Three smooth series with clear, distinct shapes so the demo reads as
	// "look — you can render areas under curves".
	const sine = Array.from({ length: 50 }, (_, i) => 50 + Math.sin(i / 4) * 40);
	const bell = Array.from({ length: 50 }, (_, i) => Math.exp(-((i - 25) ** 2) / 200) * 100);
	const ramp = Array.from({ length: 50 }, (_, i) => 20 + (i / 49) * 70 + Math.sin(i / 3) * 8);

	const varArea = [
		ansiToHtml(sparkArea(sine, { height: 3 })),
		ansiToHtml(sparkArea(bell, { height: 3 })),
		ansiToHtml(sparkArea(ramp, { height: 3 })),
	].join("\n");

	return { varColumn, varWinLoss, varBar90, varBar45, varBar15, varArea };
}

// ─── plot one-liner + misc ─────────────────────────────────────────

function makePlots() {
	const xs = Array.from({ length: 60 }, (_, i) => i);
	const revenue = xs.map(x => 60 + Math.sin(x / 5) * 30);
	const costs = xs.map(x => 40 + Math.cos(x / 4) * 20);
	const plotOneliner = ansiToHtml(
		stripColumnTrailingSpace(plot([revenue, costs], { width: 80, height: 14 })),
	);

	const demoPoints = Array.from({ length: 30 }, (_, i) => ({
		x: i,
		y: 50 + Math.sin(i / 4) * 30,
	}));
	const plotDemoSpec = chart({ width: 45, height: 10 })
		.data(demoPoints, { xKey: "x" })
		.line({ key: "y", color: "cyan" })
		.yAxis()
		.build();
	const plotDemo = ansiToHtml(
		stripColumnTrailingSpace(require("../../../src/compile").renderChartToAnsi(plotDemoSpec)),
	);

	// Line box charset demo
	const boxSpec = chart({ width: 50, height: 12, charset: "block" })
		.data(demoPoints, { xKey: "x" })
		.line({ key: "y", color: "cyan" })
		.yAxis()
		.build();
	const boxDemo = ansiToHtml(
		stripColumnTrailingSpace(require("../../../src/compile").renderChartToAnsi(boxSpec)),
	);

	const lineBox = boxDemo;

	// Domain demo — fixed y domain
	const flatData = Array.from({ length: 40 }, (_, i) => ({
		x: i,
		y: 10 + Math.sin(i / 5) * 5,
	}));
	const domainSpec = chart({ width: 45, height: 10 })
		.data(flatData, { xKey: "x" })
		.yDomain([0, 20])
		.line({ key: "y", color: "green" })
		.yAxis()
		.build();
	const domainDemo = ansiToHtml(
		stripColumnTrailingSpace(require("../../../src/compile").renderChartToAnsi(domainSpec)),
	);

	const domainFixedSpec = chart({ width: 50, height: 10 })
		.data(flatData, { xKey: "x" })
		.yDomain([0, 25])
		.line({ key: "y", color: "green" })
		.yAxis()
		.build();
	const domainFixed = ansiToHtml(
		stripColumnTrailingSpace(require("../../../src/compile").renderChartToAnsi(domainFixedSpec)),
	);

	return { plotOneliner, plotDemo, lineBox, boxDemo, domainDemo, domainFixed };
}

// ─── assemble + write ──────────────────────────────────────────────

const demos = {
	...makeSparklines(),
	...makeLineCharts(),
	...makeBarCandle(),
	...makeNewCharts(),
	...makeVariants(),
	...makePlots(),
};

const out = join(import.meta.dir, "..", "src", "data", "demos.json");
writeFileSync(out, JSON.stringify(demos, null, 2) + "\n");
console.log(`✓ Wrote ${Object.keys(demos).length} demo strings to ${out}`);
