import {Meta, StoryObj} from '@storybook/html';

import {drawStyledText} from './drawStyledText';
import {drawTextMetrics} from './drawTextMetrics';
import {measureStyledText} from './measureStyledText';
import {createCanvas} from './test-utils';
import {StyledText} from './types';

const meta: Meta = {
  title: 'measureStyledText',
};

export default meta;

const w = 800;
const h = 500;

export const Basic: StoryObj = {
  render: () => {
    const {canvas, ctx} = createCanvas(w, h);
    ctx.textBaseline = 'middle';
    const text: StyledText = [
      {text: 'There once\nwas a man from Peru.\n'},
      {text: 'who dreamed\nhe was eating his shoe.', style: {scale: 0.8}},
    ];
    const m = measureStyledText(ctx, text);
    ctx.translate(32, 64);
    drawStyledText(ctx, text, 0, 0);
    drawTextMetrics(ctx, m, 0, 0);
    return canvas;
  },
};
