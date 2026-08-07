# Contributing to @crafter/charts

Thanks for helping improve the terminal chart library.

## Architecture

The library is split into three rendering layers:

- `src/marks/` — mark render functions. Each mark knows how to draw one visual
  form (line, bar, scatter, candlestick, heatmap, and the spark variants) into
  a `Grid`.
- `src/charsets/` — low-level drawing primitives. `braille.ts` provides the
  2x4 sub-pixel canvas used by high-density marks; `block.ts` and `box.ts`
  provide character sets for coarser output.
- `src/encoders/` — output encoders. `ansi.ts`, `html.ts`, and `string.ts`
  turn a rendered `Grid` into the final string representation.

`src/compile.ts` owns the orchestration: it creates the grid, computes scales,
dispatches each mark, and then hands the grid to the requested encoder.

## Worked example: scatter

`src/marks/scatter.ts` is a good model for a new mark:

1. It receives the `Grid`, data arrays, scales, plot area, foreground color, and
   charset.
2. For braille/box output it uses `createBrailleCanvas` to get 2x4 pixel
   resolution, sets dots, renders the canvas to characters, and writes them with
   `grid.set(...)`.
3. For direct charsets it maps values to grid coordinates and writes a single
   character per point.

The mark never knows about ANSI or HTML output; it only writes characters and
foreground colors into the grid.

## Adding a toy mark

1. Create `src/marks/your-mark.ts` with an exported render function that writes
   into the `Grid`.
2. Use `grid.set(x, y, char, color)` for output. If you need sub-pixel detail,
   use a canvas from `src/charsets/`.
3. Add the mark to `MarkDef` and the builder in `src/spec.ts`.
4. Dispatch your mark in the `compile()` loop in `src/compile.ts`.
5. Add or update unit tests and snapshots.

## Validation

```bash
bun install
bun test
bun run build
bun run check
```

Keep changes focused and include a rendered example in the PR when the mark
affects visible output.
