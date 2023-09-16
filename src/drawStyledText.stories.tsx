import type {Story, StoryDefault} from '@ladle/react';
import React from 'react';

import {drawStyledText} from './drawStyledText';
import {TestCanvas} from './test-utils';

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
          {text: 'one', style: {fill: 'green', font: '40px sans-serif'}},
          {text: 'two', style: {fill: 'blue', font: '40px serif'}},
          {text: 'three', style: {fill: 'purple', font: '40px monospace'}},
          {text: 'four', style: {fill: 'red', font: '40px cursive'}},
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
      ctx.fillStyle = 'red';
      ctx.fillRect(w / 2, 0, 1, h);

      ctx.textAlign = 'left';
      drawStyledText(ctx, 'left\nand', w / 2, h * 0.1, baseStyle);

      ctx.textAlign = 'right';
      drawStyledText(ctx, 'right\nand', w / 2, h * 0.4, baseStyle);

      ctx.textAlign = 'center';
      drawStyledText(ctx, 'center\n!', w / 2, h * 0.7, baseStyle);
    }}
  />
);

export const TextBaseline: Story = () => (
  <TestCanvas
    w={w}
    h={h}
    draw={(ctx) => {
      const baseStyle = {fill: 'black'};

      ctx.textAlign = 'left';
      ctx.fillStyle = 'red';

      ctx.fillRect(0, h * 0.2, w, 1);
      ctx.textBaseline = 'alphabetic';
      drawStyledText(
        ctx,
        [{text: 'baseline '}, {text: 'alphabetic', style: {scale: 0.5}}],
        w * 0.3,
        h * 0.2,
        baseStyle,
      );

      ctx.fillRect(0, h * 0.4, w, 1);
      ctx.textBaseline = 'middle';
      drawStyledText(
        ctx,
        [{text: 'baseline '}, {text: 'middle', style: {scale: 0.5}}],
        w * 0.3,
        h * 0.4,
        baseStyle,
      );

      ctx.fillRect(0, h * 0.6, w, 1);
      ctx.textBaseline = 'hanging';
      drawStyledText(
        ctx,
        [{text: 'baseline '}, {text: 'hanging', style: {scale: 0.5}}],
        w * 0.3,
        h * 0.6,
        baseStyle,
      );
    }}
  />
);
