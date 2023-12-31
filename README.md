# canvas-styled-text

**[See examples!](https://loganzartman.github.io/canvas-styled-text)**

[![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/loganzartman/canvas-styled-text/workflow.yaml)](https://github.com/loganzartman/canvas-styled-text/actions) [![npm](https://img.shields.io/npm/v/canvas-styled-text)](https://www.npmjs.com/package/canvas-styled-text) [![npm package minimized gzipped size (select exports)](https://img.shields.io/bundlejs/size/canvas-styled-text)](https://www.npmjs.com/package/canvas-styled-text)

<img src="https://github.com/loganzartman/canvas-styled-text/assets/3401573/cfa18954-8ec9-42c9-926a-359e7efdc8fc" width="50%" />

`fillText` and `strokeText` but with support for multiple lines and multiple fonts and styles in one block of text! This is an overengineered solution to my simple problem of drawing subscript text in canvas. Some extra features have crept in.

This is inspired by but not conforming to the [canvas-formatted-text WICG proposal](https://github.com/WICG/canvas-formatted-text). (Hopefully this will be unnecessary someday!)

Features:

- [x] change font
- [x] change text fill and stroke
- [x] draw multiple lines with correct line height
- [x] textAlign and textBaseline
- [x] basic support for direction (LTR or RTL)
- [x] scale text
- [x] vertical offset
- [x] shadows
- [x] inherits style from canvas context by default
- [x] supports pre-rendering for super-fast drawing
- [x] no runtime dependencies!
- [x] somewhat tested!

Not supported:

- [ ] automatic word wrapping (maybe someday)
- [ ] vertical text

## Installation

`npm i -s canvas-styled-text`

## Use it!

### Draw styled text

```typescript
import {drawStyledText} from 'canvas-styled-text';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// draws boring unformatted strings if you want
drawStyledText(ctx, 'Hello world', 100, 100);

// supports textAlign and textBaseline (must be set globally)
ctx.textAlign = 'center';
ctx.textBaseline = 'center';

// the fun part: multiple spans of text
drawStyledText(
  ctx,
  [
    // spans are concatenated in order...
    'Hello',
    // you can override style props for each text span
    {text: 'world', style: {fill: 'red'}},
    // you can put a newline anywhere, it will work as expected
    '!\n',
    // style props mirror those available in canvas
    {text: 'New font', style: {font: '10px serif'}},
    // you can do some basic typesetting (this looks like a superscript)
    {text: '2', style: {scale: 0.75, top: {value: -30, unit: '%'}}},
  ],
  100,
  200,
);
```

### Measure styled text

```typescript
import {measureStyledText} from 'canvas-styled-text';

// ...

// produces a single TextMetrics object, like ctx.measureText()
const metrics = measureStyledText(ctx, [
  {text: 'Hello\n'},
  {text: 'world!', style: {scale: 1.2}},
]);
```

### Cache for performance

You can create a `PrestyledText` when you're drawing the same text with the same style frequently. The text metrics are computed and the text is rendered to an offscreen canvas lazily, so that drawing the text only requires an image copy. Keep in mind that **it doesn't inherit styles from the context**.

```typescript
import {PrestyledText, drawStyledText} from 'canvas-styled-text';

const text = new PrestyledText('Hello cache!', {
  fill: 'purple',
  align: 'center',
  baseline: 'middle',
});

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

drawStyledText(ctx, text, 100, 100);
```

`PrestyledText` respects the current transformation of the canvas. If you change the scale of the canvas by a noticeable amount, the cached rendering is automatically updated for the new scale.

```typescript
const text = new PrestyledText('Hello cache!', {
  fill: 'purple',
  align: 'center',
  baseline: 'middle',
});

ctx.translate(100, 100);
ctx.rotate(0.1);
ctx.scale(2);
drawStyledText(ctx, text, 0, 0);
```

## Running tests

I use [Ladle](https://ladle.dev/) for stories and [Playwright]() to generate snapshot images of them. Unfortunately, because this project is about text rendering, we need to run in Docker for consistent font rendering.

To run tests:

1. [Install Docker](https://docs.docker.com/engine/install/)
2. Run `pnpm test` to build the Docker image and run Playwright in it
