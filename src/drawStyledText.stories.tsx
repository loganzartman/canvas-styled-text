import type {Story, StoryDefault} from '@ladle/react';
import React from 'react';

import {drawStyledText} from './drawStyledText';
import {TestCanvas} from './test-utils';
import {StyledTextStyle} from './types';

export default {
  title: 'Draw styled text',
} satisfies StoryDefault;

const w = 800;
const h = 500;

const makeGradient = (ctx: CanvasRenderingContext2D) => {
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.min(w, h));
  gradient.addColorStop(0.05, 'aqua');
  gradient.addColorStop(0.1, 'blue');
  gradient.addColorStop(0.15, 'purple');
  gradient.addColorStop(0.2, 'fuchsia');
  return gradient;
};

export const Basic: Story = () => (
  <TestCanvas
    w={w}
    h={h}
    draw={(ctx) => {
      drawStyledText(ctx, 'Hello world!', 32, 32);
    }}
  />
);

export const Spans: Story = () => (
  <TestCanvas
    w={w}
    h={h}
    draw={(ctx) => {
      drawStyledText(
        ctx,
        [
          {text: 'graphic', style: {fill: 'green', font: '40px system-ui'}},
          {text: 'design', style: {fill: 'blue', font: '40px serif'}},
          {text: 'is', style: {fill: 'purple', font: '40px monospace'}},
          {text: 'my', style: {fill: 'red', font: '40px cursive'}},
          {text: 'passion', style: {fill: 'orange', font: '40px fantasy'}},
        ],
        32,
        32,
      );
    }}
  />
);

export const Multiline: Story = () => (
  <TestCanvas
    w={w}
    h={h}
    draw={(ctx) => {
      ctx.textAlign = 'left';
      drawStyledText(ctx, 'Hello\nworld!', 32, 32);
    }}
  />
);

export const TextAlign: Story = () => (
  <TestCanvas
    w={w}
    h={h}
    draw={(ctx) => {
      const baseStyle = {fill: 'black'};

      ctx.textBaseline = 'top';
      ctx.font = '34px sans-serif';
      ctx.fillStyle = 'red';
      ctx.fillRect(w / 2, 0, 1, h);

      const aligns: CanvasTextAlign[] = [
        'start',
        'left',
        'center',
        'right',
        'end',
      ];
      aligns.forEach((align, i) => {
        ctx.textAlign = align;
        drawStyledText(
          ctx,
          ['text at', ' the', '\n', {text: align}],
          w / 2,
          (h * (i + 0.5)) / (aligns.length + 1),
          baseStyle,
        );
      });
    }}
  />
);

export const TextBaseline: Story = () => (
  <TestCanvas
    w={w}
    h={h}
    draw={(ctx) => {
      const baseStyle = {fill: 'black'};

      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'red';

      const baselines: CanvasTextBaseline[] = [
        'alphabetic',
        'bottom',
        'hanging',
        'ideographic',
        'middle',
        'top',
      ];

      baselines.forEach((baseline, i) => {
        const y = (h * (i + 1)) / (baselines.length + 1);
        ctx.textBaseline = baseline;
        ctx.fillRect(0, y, w, 1);
        drawStyledText(
          ctx,
          ['baseline ', {text: baseline, style: {scale: 0.5}}],
          w * 0.5,
          y,
          baseStyle,
        );
      });
    }}
  />
);

export const KitchenSink: Story = () => (
  <TestCanvas
    w={w}
    h={h}
    draw={(ctx) => {
      const baseStyle: StyledTextStyle = {font: '32px sans-serif'};

      drawStyledText(
        ctx,
        [
          'You can set ',
          {text: 'colors ', style: {fill: 'purple'}},
          'and ',
          {text: 'fonts,\n', style: {fill: 'blue', font: '32px serif'}},
          {
            text: 'add multiple lines,\n',
            style: {font: 'italic 32px sans-serif'},
          },
          'plus fun ',
          {
            text: 'strokes ',
            style: {
              fill: 'white',
              stroke: makeGradient(ctx),
              strokeWidth: 2,
            },
          },
          'and ',
          {
            text: 'shadows,\n',
            style: {
              shadowBlur: 4,
              shadowOffsetY: 4,
              shadowColor: 'darkslateblue',
            },
          },
          'or even ',
          {text: 'scale', style: {scale: 1.2, fill: 'rebeccapurple'}},
          ' and ',
          {
            text: 'offset',
            style: {
              scale: 0.7,
              top: {value: 80, unit: '%'},
              fill: 'darkorchid',
            },
          },
          ' your text!',
        ],
        32,
        32,
        baseStyle,
      );
    }}
  />
);

export const PerformanceTest: Story = () => (
  <TestCanvas
    w={w}
    h={h}
    draw={(ctx) => {
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const n = 1000;
      for (let i = 0; i < n; ++i) {
        drawStyledText(
          ctx,
          'Hello\nworld!',
          (Math.sin((i / n) * Math.PI * 2 + Date.now() * 0.0005) * w) / 2 +
            w / 2,
          (Math.cos((i / n) * Math.PI * 16 + Date.now() * 0.001) * h) / 2 +
            h / 2,
        );
      }
    }}
  />
);
PerformanceTest.meta = {
  snapshotTest: false,
};
