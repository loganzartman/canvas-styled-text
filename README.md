# canvas-styled-text

**[See examples!](https://loganzartman.github.io/canvas-styled-text)**

<img src="https://github.com/loganzartman/canvas-styled-text/assets/3401573/1c42a24e-2215-43c4-a9f6-8564ba69257d" width="50%" />

`fillText` and `strokeText` but with support for multiple lines and multiple fonts and styles in one block of text!

Inspired by but not even vaguely conforming to the [canvas-formatted-text WICG proposal](https://github.com/WICG/canvas-formatted-text).

Hopefully this will be unnecessary someday!

Features:

- change font, etc.
- change text fill and stroke
- multiple lines
- supports textAlign and textBaseline
- scale text
- vertical offset
- shadows
- inherits style from canvas context by default
- no runtime dependencies!
- tested!

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
