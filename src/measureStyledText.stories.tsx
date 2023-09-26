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
      const baseStyle = {lineHeight: 1};
      ctx.textBaseline = 'middle';
      const text: StyledText = [
        'There once\nwas a man from Peru,\n',
        {text: 'who dreamed\nhe was eating his shoe.', style: {scale: 0.8}},
      ];
      const m = measureStyledText(ctx, text, baseStyle);
      ctx.translate(32, 64);
      drawTextMetrics(ctx, m, 0, 0);
      drawStyledText(ctx, text, 0, 0, baseStyle);
    }}
  />
);

export const Playground: Story<{
  text: StyledText;
  x: number;
  y: number;
  direction: CanvasDirection;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  lineHeight: number;
}> = ({text, direction, textAlign, textBaseline, lineHeight}) => (
  <TestCanvas
    w={w}
    h={h}
    draw={(ctx) => {
      ctx.save();
      ctx.direction = direction;
      ctx.textAlign = textAlign;
      ctx.textBaseline = textBaseline;
      const m = measureStyledText(ctx, text, {lineHeight});
      console.log(m);
      ctx.fillStyle = 'lime';
      ctx.fillRect(0, h / 2, w, 1);
      ctx.fillRect(w / 2, 0, 1, h);
      ctx.fillStyle = 'black';
      ctx.translate(w / 2, h / 2);
      drawTextMetrics(ctx, m, 0, 0);
      drawStyledText(ctx, text, 0, 0, {lineHeight});
      ctx.restore();
    }}
  />
);
Playground.args = {
  text: {text: 'Hello world!'},
  direction: 'ltr',
  textAlign: 'center',
  textBaseline: 'middle',
  lineHeight: 1,
};
Playground.argTypes = {
  direction: {
    options: ['inherit', 'ltr', 'rtl'],
    control: {
      type: 'select',
    },
  },
  textAlign: {
    options: ['center', 'end', 'left', 'right', 'start'],
    control: {
      type: 'select',
    },
  },
  textBaseline: {
    options: [
      'alphabetic',
      'bottom',
      'hanging',
      'ideographic',
      'middle',
      'top',
    ],
    control: {
      type: 'select',
    },
  },
};

export const AlignAccuracy: Story<{
  direction: CanvasDirection;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
}> = () => {
  const text = 'Hello world!';
  const drawTest = (ctx) => {
    // styled
    const stm = measureStyledText(ctx, text);
    drawTextMetrics(ctx, stm, 0, 0);
    drawStyledText(ctx, text, 0, 0);

    // native
    const ntm = ctx.measureText(text);
    const yOffset =
      stm.actualBoundingBoxDescent + ntm.actualBoundingBoxAscent + 5;
    drawTextMetrics(ctx, ntm, 0, yOffset);
    ctx.fillText(text, 0, yOffset);

    // labels
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'red';
    ctx.fillText('styled', -ntm.actualBoundingBoxLeft - 16, 0);
    ctx.fillText('native', -ntm.actualBoundingBoxLeft - 16, yOffset);
  };

  const aligns: Array<CanvasTextAlign> = ['right', 'center', 'left'];
  const baselines: Array<CanvasTextBaseline> = [
    'bottom',
    'ideographic',
    'alphabetic',
    'middle',
    'hanging',
    'top',
  ];

  return (
    <TestCanvas
      w={w}
      h={h}
      draw={(ctx) => {
        ctx.fillStyle = 'black';
        ctx.font = '24px sans-serif';

        aligns.forEach((align, ia) => {
          baselines.forEach((baseline, ib) => {
            ctx.textAlign = align;
            ctx.textBaseline = baseline;

            ctx.save();
            ctx.translate(
              (w * (ia + 1)) / (aligns.length + 1),
              (h * (ib + 1)) / (baselines.length + 1),
            );
            drawTest(ctx);
            ctx.restore();
          });
        });
      }}
    />
  );
};
