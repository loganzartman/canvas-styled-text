import {Meta, StoryObj} from '@storybook/html';

import {drawStyledText} from './drawStyledText';
import {createCanvas} from './test-utils';
import {StyledText, StyledTextStyle} from './types';

const meta: Meta = {
  title: 'drawStyledText',
};

export default meta;

const w = 800;
const h = 500;

const makeArgs = ({
  text,
  x,
  y,
  baseStyle,
}: {
  text?: StyledText;
  x?: number;
  y?: number;
  baseStyle?: StyledTextStyle;
}) => ({
  args: {...(text && {text}), ...(x && {x}), ...(y && {y}), baseStyle},
  argTypes: {
    ...(text && {text: {control: {type: 'object'}}}),
    ...(x && {x: {control: {type: 'number'}}}),
    ...(y && {y: {control: {type: 'number'}}}),
    baseStyle: {control: {type: 'object'}},
  },
});

export const Basic: StoryObj = {
  render: () => {
    const {canvas, ctx} = createCanvas(w, h);
    drawStyledText(ctx, 'Hello world!', 32, 32);
    return canvas;
  },
};

export const Spans: StoryObj = {
  render: ({text, x, y, baseStyle}) => {
    const {canvas, ctx} = createCanvas(w, h);
    drawStyledText(ctx, text, x, y, baseStyle);
    return canvas;
  },
  ...makeArgs({
    text: [
      {text: 'one', style: {fill: 'green', font: '40px sans-serif'}},
      {text: 'two', style: {fill: 'blue', font: '40px serif'}},
      {text: 'three', style: {fill: 'purple', font: '40px monospace'}},
      {text: 'four', style: {fill: 'red', font: '40px cursive'}},
    ],
    x: 32,
    y: 32,
  }),
};

export const Multiline: StoryObj = {
  render: ({text, x, y, baseStyle}) => {
    const {canvas, ctx} = createCanvas(w, h);
    drawStyledText(ctx, text, x, y, baseStyle);
    return canvas;
  },
  ...makeArgs({text: 'Hello\nworld!', x: 32, y: 32}),
};

export const TextAlign: StoryObj = {
  render: () => {
    const {canvas, ctx} = createCanvas(w, h);
    const baseStyle = {fill: 'black'};

    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'red';
    ctx.fillRect(w / 2, 0, 1, h);
    drawStyledText(ctx, 'left\nand', w / 2, h * 0.1, baseStyle);
    ctx.textAlign = 'right';
    drawStyledText(ctx, 'right\nand', w / 2, h * 0.4, baseStyle);
    ctx.textAlign = 'center';
    drawStyledText(ctx, 'center\n!', w / 2, h * 0.7, baseStyle);

    return canvas;
  },
};

export const TextBaseline: StoryObj = {
  render: () => {
    const {canvas, ctx} = createCanvas(w, h);
    const baseStyle = {fill: 'black'};

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'red';
    ctx.fillRect(0, h * 0.2, w, 1);
    drawStyledText(
      ctx,
      [{text: 'baseline '}, {text: 'alphabetic', style: {scale: 0.5}}],
      w * 0.3,
      h * 0.2,
      baseStyle,
    );
    ctx.textBaseline = 'middle';
    ctx.fillRect(0, h * 0.4, w, 1);
    drawStyledText(
      ctx,
      [{text: 'baseline '}, {text: 'middle', style: {scale: 0.5}}],
      w * 0.3,
      h * 0.4,
      baseStyle,
    );
    ctx.textBaseline = 'hanging';
    ctx.fillRect(0, h * 0.6, w, 1);
    drawStyledText(
      ctx,
      [{text: 'baseline '}, {text: 'hanging', style: {scale: 0.5}}],
      w * 0.3,
      h * 0.6,
      baseStyle,
    );

    return canvas;
  },
};

export const KitchenSink: StoryObj = {
  render: ({text, x, y, baseStyle}) => {
    const {canvas, ctx} = createCanvas(w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    drawStyledText(ctx, text, x, y, baseStyle);
    return canvas;
  },
  ...makeArgs({
    text: [
      {text: 'Hello '},
      {text: 'world! ', style: {fill: 'red'}},
      {text: 'how are ya?\n', style: {font: '32px serif'}},
      {
        text: 'read between the lines...\n',
        style: {font: '18px sans-serif'},
      },
      {text: "Let's ", style: {scale: 1.1}},
      {text: 'scale!', style: {scale: 0.75}},
    ],
    x: w / 2,
    y: 32,
  }),
};
