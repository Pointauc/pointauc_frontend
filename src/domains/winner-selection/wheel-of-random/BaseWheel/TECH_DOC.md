# BaseWheel Part Architecture

## Purpose
`BaseWheel` now separates wheel visuals into composable parts so style logic is no longer locked inside one renderer class. This makes styles easier to extend, replace, and eventually mix.

## Parts
- `spinningWheel`: renders the participant wheel and owns imperative wheel actions such as `spin`, `setRotation`, `redraw`, and `eatAnimation`
- `pointer`: renders the selector/pointer
- `effects`: renders decorative animated effects and reacts to `isSpinning`

Each part chooses its own rendering technology: canvas, SVG, or HTML.

## Responsibilities
- `BaseWheel` owns shared layout, normalized items, winner/core state, highlighting state, `isSpinning`, and the public `WheelController`
- style resolution happens above `BaseWheel` through `resolveWheelParts(...)`
- a style is now a composition of part variants, not a single renderer implementation

## Why This Helps
- removes tight coupling between wheel slices, pointer, and effects
- keeps external wheel APIs stable while allowing internal evolution
- makes future mixed-style compositions possible without another large refactor
