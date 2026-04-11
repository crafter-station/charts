# @crafter/charts

Recharts for your terminal. 15 chart types, zero deps, TypeScript.

```
  cpu ▄▅▆▇███▇▆▅▃▂▁▂▃▄
  mem  ▁▃▅▇█████▇▅▃▁
  err    ▁ ▁  ▃█▂▁

       │     ⢀⠔⠊⠉⠉⠑⢄
     80┤   ⢀⠎       ⠱⡀
       │  ⡰⠁         ⠘⢄
     60┤ ⡰⠁            ⢣
       │                 ⠱⡀
     40┤                  ⠘⢄
       │                   ⠑⠢⢄⣀⣀⠔⠉
```

## Install

```bash
bun add @crafter/charts
```

## Quick Start

```ts
import { plot, sparkline, chart, renderToAnsi } from "@crafter/charts";

// One-liner
console.log(plot([1, 5, 3, 7, 2, 8]));

// Sparkline
console.log(sparkline([10, 15, 12, 18, 14, 20], { color: "green" }));

// Full chart
const c = chart({ width: 60, height: 14 })
  .data(rows, { xKey: "x" })
  .yAxis({ format: (v) => "$" + v.toFixed(0) })
  .line({ key: "price", color: "green", label: "Price" });

console.log(renderToAnsi(c));
```

## Chart Types

| Type | Function | Inline? |
|------|----------|---------|
| Line (braille) | `chart().line()` | No |
| Line (box) | `chart({ charset: "box" }).line()` | No |
| Bar | `chart().bar()` | No |
| Scatter | `chart().scatter()` | No |
| Candlestick | `chart().candlestick()` | No |
| Plot | `plot(data)` | No |
| Sparkline | `sparkline()` | Yes |
| Column | `sparkColumn()` | Yes |
| Bar | `sparkBar()` | Yes |
| Win/Loss | `sparkWinLoss()` | Yes |
| Area | `sparkArea()` | Multi-line |
| Heatmap | `sparkHeatmap()` | Multi-line |
| Histogram | `sparkHistogram()` | Multi-line |
| Gauge | `sparkGauge()` | Yes |
| Donut | `sparkDonut()` | Yes |

## Features

- **Zero dependencies**
- **TypeScript strict** with exported types
- **Braille rendering** (4x2 sub-pixel per character)
- **4 charsets**: braille, box (╭╮╰╯─│), block, ascii
- **3 render targets**: `renderToAnsi()`, `renderToString()`, `renderToHtml()`
- **Deterministic snapshots** for CI (`toMatchSnapshot()`)
- **Auto-sized** to terminal width
- **Fixed domain** via `.yDomain([min, max])`
- **Multi-series** with colored legend

## Links

- [Landing](https://charts.crafter.run)
- [npm](https://www.npmjs.com/package/@crafter/charts)
- [GitHub](https://github.com/crafter-station/charts)

## License

MIT
