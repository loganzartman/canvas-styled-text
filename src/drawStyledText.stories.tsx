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
