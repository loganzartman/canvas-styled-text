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
          [{text: 'text '}, {text: 'at '}, {text: 'the\n'}, {text: align}],
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
          [{text: 'baseline '}, {text: baseline, style: {scale: 0.5}}],
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
      const baseStyle: StyledTextStyle = {font: '32px serif'};

      drawStyledText(
        ctx,
        [
          {text: 'The perfect '},
          {text: 'square', style: {fill: 'red'}},
          {text: ' has no '},
          {text: 'corners', style: {scale: 0.7, top: {value: -80, unit: '%'}}},
          {text: '\n'},
          {text: 'Great '},
          {
            text: 'talents',
            style: {
              stroke: 'purple',
              fill: 'white',
              strokeWidth: 2,
              font: 'italic 40px cursive',
            },
          },
          {text: ' ripen late\n'},
          {text: 'The highest notes are hard to hear\n', style: {scale: 0.5}},
          {
            text: 'The greatest form has no shape\n',
            style: {font: '30px sans-serif', fill: 'green'},
          },
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
