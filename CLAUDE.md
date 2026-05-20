# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server
npm run build      # type-check (vue-tsc) then build
npm run preview    # preview production build
```

There are no tests or a linter configured. Type checking is the only automated correctness check (`vue-tsc -b` inside `build`).

## Architecture

Physics diagram tool built with Vue 3 + TypeScript + Vite. Three diagram types: **Free Body Diagram** (`/free-body-diagram`), **Motion Map** (`/motion-map`), and **Apparatus** (`/apparatus`). Static site generated with `vite-ssg`.

### Layer structure

Each diagram follows the same three-layer pattern:

1. **View** (`src/views/`) — wires composable state to canvas and sidebar via props/events; registers global keyboard shortcuts (`Delete`/`Backspace`, `Escape`, `Cmd+Z`); owns the export ref chain.
2. **Composable** (`src/composables/`) — all business logic; returns reactive state and mutation functions. Each embeds a `useUndoStack` instance.
3. **Diagram components** (`src/diagrams/`) — split into a canvas component (SVG rendering + pointer events) and a sidebar/controls panel. Canvas components expose `svgEl` via `defineExpose` for the export path.

### State and undo

State lives in composables as a plain `ref<State>`. Mutations replace the whole state object (immutable-style spreads). Two-phase update pattern for drag:
- `moveObject` / `updateVector` / `updateDotPosition` — called on every `pointermove`; updates state live, no undo push.
- `commitMove` / `commitVectorUpdate` / `commitDotUpdate` — called on `pointerup`; pushes to undo stack.

`useUndoStack` stores up to 50 `structuredClone`d snapshots in a plain array (not a Vue ref) with a `_version` trigger ref to keep `canUndo` reactive.

### SVG canvas pattern

Canvas components convert pointer client coordinates to SVG space using `createSVGPoint().matrixTransform(getScreenCTM()!.inverse())`. Dragging uses `setPointerCapture` on the SVG element.

- **FBD canvas**: 800×600, object centered at (400, 300).
- **Motion Map canvas**: 800×500, baseline at y=260 (horizontal) or x=260 (vertical).
- **Apparatus canvas**: 900×650 viewBox with an infinite-grid feel; has a pan/zoom viewport layer (`vpX`, `vpY`, `vpScale` as local refs, not in undo stack). Coordinate conversion must account for the viewport transform: `(svgPt - vpOffset) / vpScale`.

### Apparatus diagram specifics

Objects are placed by HTML5 drag-and-drop from the sidebar: `dragstart` sets `apparatus-type` (and optionally `apparatus-label`) on `dataTransfer`; the canvas `drop` handler calls `addObject`. A `dropGuard` flag blocks the synthetic `pointerdown` some browsers fire immediately after a drop.

Each `ApparatusObject` has `x`, `y`, `width`, `height`, `rotation`, and `labels[]`. The canvas renders a selection overlay with 8 resize handles and a rotation handle above the bounding box. Resize math decomposes the drag delta into local object axes using the object's rotation angle.

`ApparatusObjectRenderer` dispatches to the per-type SVG component (e.g. `AppBox`, `AppSpring`, `AppIncline`). All object SVGs are centered at `(0, 0)` and sized to `width × height` props, so the parent `<g transform="translate(x,y) rotate(rotation)">` handles positioning.

The `standalone-label` type is a label-only object (no shape) that behaves like other objects for drag/select/delete.

### Snap

`useSnap.ts` exports `snapToIncrement(value, increment)` and `snapInclineCenter(cx, cy, width, height, gridSpacing)`. The incline snaps its bottom-left corner to the grid rather than its center. Apparatus snaps positions and resize dimensions to `state.gridSpacing` (default 40px) and rotation to 15°. FBD snaps angles to 15° and magnitudes to 20px (minimum 30px); motion map snaps to 10px. All snap behaviors are guarded by `state.snapEnabled`.

### Export

`useExport` produces a tight-cropped PNG at 2× scale:

1. Captures all `<foreignObject>` screen positions and pre-renders each KaTeX label to a canvas via `html-to-image`.
2. Temporarily removes `[data-no-export="true"]` elements (grid, selection overlay) to get a clean `getBBox()`, then restores them.
3. Clones the SVG with `foreignObject` elements removed and a cropped `viewBox` (content bbox + 20px padding).
4. Draws the SVG to a canvas, then composites the pre-rendered label canvases at their mapped positions.

`<foreignObject>` elements must carry `data-label` (LaTeX string) and `data-color` attributes for the export pipeline. Elements that should not appear in the export (grid lines, selection handles) must have `data-no-export="true"`.

### UI components

Uses **reka-ui** as the headless component library and **Tailwind CSS v4**. Icons from **lucide-vue-next**. Math labels rendered with **KaTeX** inside SVG `<foreignObject>` elements via `KaTeXLabel.vue`.
