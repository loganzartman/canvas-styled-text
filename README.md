# canvas-styled-text

`fillText` but with support for multiple lines and multiple fonts and styles in one block of text!

Inspired by but not conforming to the [canvas-formatted-text WICG proposal](https://github.com/WICG/canvas-formatted-text).

Hopefully this will be unnecessary someday!

## [Examples](https://loganzartman.github.io/canvas-styled-text)

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

// supports some different textAligns and textBaselines (must be set globally)
ctx.textAlign = 'center';
ctx.textBaseline = 'center';

// the fun part: multiple spans of text
drawStyledText(
  ctx,
  [
    // spans are concatenated in order...
    {text: 'Hello '},
    // you can override style props for each text span
    {text: 'world', style: {fill: 'red'}},
    // you can put a newline anywhere, it will work as expected
    {text: '!\n'},
    // style props mirror those available in canvas
    {text: 'New font', style: {font: '10px serif'}},
    // you can do some basic typesetting (this looks like a superscript)
    {text: '2', style: {scale: 0.75, top: {value: '-30', unit: '%'}}},
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
