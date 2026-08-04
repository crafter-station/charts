# @crafter/charts — agent guide

@crafter/charts is a zero-dependency TypeScript library that renders charts as text for terminals: braille-resolution line charts, bar, scatter, and candlestick charts via a composable Recharts-style builder, plus inline sparkline primitives (column, bar, win/loss, area, heatmap, histogram, gauge, donut). Output is a plain string (ANSI-colored, uncolored, or HTML), deterministic, and snapshot-friendly for CI. An agent should use it whenever a CLI, TUI, log line, monitoring script, or test needs a chart without a browser or image pipeline.

## Install

```bash
bun add @crafter/charts
npm install @crafter/charts
```

Library only, no CLI binary. Works in Bun and Node (ESM, `import` only). TypeScript ^5 is a peer dependency.

## API (from src/index.ts)

One-liners:

- `plot(data: number[] | number[][], options?: { width?, height?, min?, max?, color?, charset? }): string` — quickest full chart; pass an array of arrays for multi-series
- `sparkline(data: number[], options?: { width?, min?, max?, color? }): string` — inline `▂▃▅▇█` trend

Builder (Recharts-style, immutable chaining):

- `chart(opts?: { width?: number | "auto"; height?: number | "auto"; charset?: "braille" | "block" | "ascii" | "box" }): ChartBuilder`
- `.data(rows: Record<string, number>[], opts?: { xKey?: string })`
- `.line({ key, color?, label? })` / `.bar({ key, color?, label? })` / `.scatter({ key, color?, label? })`
- `.candlestick({ open, high, low, close, color? })` — keys into your rows
- `.yDomain([min, max])` — fix the domain (stable snapshots)
- `.xAxis(opts?)` / `.yAxis(opts?)` — `format` is `"number" | "date" | (v: number) => string`
- `.build(): ChartSpec`

Render targets (take the builder, not the spec):

- `renderToAnsi(builder)` — ANSI colors for terminals
- `renderToString(builder)` — plain text, no escape codes (snapshots, logs, LLM output)
- `renderToHtml(builder)` — HTML

Sparkline variants:

- `sparkColumn(data: number[], options?)` and `sparkArea(data: number[], options?)` — inline column / multi-line area
- `sparkBar(value: number, max: number, options?)` — single horizontal bar
- `sparkWinLoss(data: number[], options?)` — win/loss strip from +/- values
- `sparkHeatmap(data: number[][], options?)` — multi-line heatmap
- `sparkHistogram(data: number[], options?)` — binned distribution
- `sparkGauge(value: number, max: number, options?)` / `sparkDonut(value: number, max: number, options?)`
- Low-level: `renderSparkline`, `renderSparklineString`, `renderSparklineHtml`

Colors (`AnsiColor`): red, green, yellow, blue, magenta, cyan, white, gray, etc. All option interfaces are exported types.

## Usage patterns

1. Instant trend from an array:
   ```ts
   import { plot, sparkline } from "@crafter/charts";
   console.log(plot([1, 5, 3, 7, 2, 8]));
   console.log(sparkline([10, 15, 12, 18, 14, 20], { color: "green" }));
   ```
2. Multi-series line chart with formatted axis:
   ```ts
   import { chart, renderToAnsi } from "@crafter/charts";
   const c = chart({ width: 60, height: 14 })
     .data(rows, { xKey: "x" })
     .yAxis({ format: (v) => "$" + v.toFixed(0) })
     .line({ key: "price", color: "green", label: "Price" });
   console.log(renderToAnsi(c));
   ```
3. Candlestick from OHLC rows:
   ```ts
   const c = chart({ width: 70, height: 16 })
     .data(candles, { xKey: "t" })
     .candlestick({ open: "o", high: "h", low: "l", close: "c" });
   console.log(renderToAnsi(c));
   ```
4. Deterministic snapshot test (Bun):
   ```ts
   import { chart, renderToString } from "@crafter/charts";
   const out = renderToString(chart({ width: 40, height: 10 }).data(rows).yDomain([0, 100]).line({ key: "v" }));
   expect(out).toMatchSnapshot();
   ```

## Task -> API

| Task | Use |
|------|-----|
| Trend line inside a sentence/table cell | `sparkline(data)` |
| Quick chart of a numeric array | `plot(data)` |
| Multi-series / labeled / axis-formatted chart | `chart()...` + `renderToAnsi` |
| OHLC / trading view | `chart().candlestick(...)` |
| Progress or percentage | `sparkBar(value, max)` or `sparkGauge(value, max)` |
| Distribution of samples | `sparkHistogram(data)` |
| 2D intensity grid | `sparkHeatmap(matrix)` |
| CI snapshot or log output without ANSI codes | `renderToString(builder)` |
| Chart in a web page/email | `renderToHtml(builder)` |

## Common mistakes

- Wrong: `npm i crafter-charts` or `npm i charts` / Correct: `npm i @crafter/charts` (scoped name)
- Wrong: `renderToAnsi(builder.build())` / Correct: `renderToAnsi(builder)` — the render functions call `.build()` internally; only call `.build()` if you need the raw `ChartSpec`
- Wrong: `require("@crafter/charts")` / Correct: ESM `import` only — the package exports no CommonJS entry
- Wrong: snapshotting `renderToAnsi` output with auto width / Correct: use `renderToString` with explicit `width`/`height` and `.yDomain([min, max])` so snapshots are terminal-independent
- Wrong: expecting braille output everywhere / Correct: braille needs a Unicode-capable font; pass `charset: "ascii"` (or `"block"`/`"box"`) for dumb terminals
- Note: `sparkBar`, `sparkGauge`, `sparkDonut` take `(value, max)` scalars, not arrays; `sparkHeatmap` takes `number[][]`

Docs: https://charts.crafter.run
