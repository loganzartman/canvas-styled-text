import {Story, StoryDefault} from '@ladle/react';
import React from 'react';

import {drawStyledText} from './drawStyledText';
import {drawTextMetrics} from './drawTextMetrics';
import {measureStyledText} from './measureStyledText';
import {TestCanvas} from './test-utils';
import {StyledText} from './types';

export default {
  title: 'Measure styled text',
} satisfies StoryDefault;

const w = 800;
const h = 500;

export const Basic: Story = () => (
  <TestCanvas
    w={w}
    h={h}
    draw={(ctx) => {
      ctx.textBaseline = 'middle';
      const text: StyledText = [
        {text: 'There once\nwas a man from Peru,\n'},
        {text: 'who dreamed\nhe was eating his shoe.', style: {scale: 0.8}},
      ];
      const m = measureStyledText(ctx, text);
      ctx.translate(32, 64);
      drawStyledText(ctx, text, 0, 0);
      drawTextMetrics(ctx, m, 0, 0);
    }}
  />
);
