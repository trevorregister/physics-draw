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

Physics diagram tool built with Vue 3 + TypeScript + Vite. Two diagram types: **Free Body Diagram** (`/fbd`) and **Motion Map** (`/motion-map`).

### Layer structure

Each diagram follows the same three-layer pattern:

1. **View** (`src/views/`) — wires composable state to canvas and sidebar via props/events; registers global keyboard shortcuts (`Delete`, `Escape`, `Cmd+Z`); owns the export ref chain.
2. **Composable** (`src/composables/`) — all business logic; returns reactive state and mutation functions. `useFBD` and `useMotionMap` each embed a `useUndoStack` instance.
3. **Diagram components** (`src/diagrams/fbd/`, `src/diagrams/motion-map/`) — split into `*Canvas.vue` (SVG rendering + pointer events) and `*Sidebar.vue` (controls panel). Canvas components expose `svgEl` via `defineExpose` for the export path.

### State and undo

State lives in composables as a plain `ref<State>`. Mutations replace the whole state object (immutable-style spreads). Two-phase update pattern for drag:
- `updateVector` / `updateDotPosition` — called on every `pointermove`; updates state live, no undo push.
- `commitVectorUpdate` / `commitDotUpdate` — called on `pointerup`; pushes to undo stack.

`useUndoStack` stores up to 50 `structuredClone`d snapshots in a plain array (not a Vue ref) with a `_version` trigger ref to keep `canUndo` reactive.

### SVG canvas pattern

Canvas components use `createSVGPoint().matrixTransform(getScreenCTM()!.inverse())` to convert pointer client coordinates to SVG space. Dragging uses `setPointerCapture` on the SVG element. FBD canvas is 800×600 with the object centered at (400, 300); Motion Map canvas is 800×500 with a baseline at y=260 (horizontal) or x=260 (vertical).

### Snap

`useSnap.ts` exports a single `snapToIncrement(value, increment)` utility. FBD snaps angles to 15° and magnitudes to 20px (minimum 30px); motion map snaps dot positions to 10px. Both snap behaviors are guarded by `state.snapEnabled`.

### Export

`useExport` clones the SVG, replaces all `<foreignObject>` elements (used for KaTeX-rendered labels) with plain `<text>` nodes using `data-label` and `data-color` attributes, then renders to a canvas at 2× scale before downloading as PNG.

### UI components

Uses **reka-ui** as the headless component library and **Tailwind CSS v4**. Icons from **lucide-vue-next**. Math labels rendered with **KaTeX** inside SVG `<foreignObject>` elements.
