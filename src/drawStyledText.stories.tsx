import type {Story, StoryDefault} from '@ladle/react';
import React, {useMemo, useRef} from 'react';

import {drawStyledText} from './drawStyledText';
import {PrestyledText} from './prestyledText';
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

export const PerformanceTest: Story = () => {
  const style = useMemo(
    () =>
      ({
        font: `24px system-ui`,
        fill: 'blue',
        align: 'center',
        baseline: 'middle',
        shadowBlur: 8,
        shadowOffsetY: 8,
        shadowColor: 'rgba(0,0,0,0.66)',
      }) as const,
    [],
  );

  const donut = useMemo(() => new PrestyledText('🍩', style), []);
  const cupcake = useMemo(() => new PrestyledText('🧁', style), []);
  const candy = useMemo(() => new PrestyledText('🍰', style), []);
  const foods = [donut, cupcake, candy];

  const S = 0.005;
  const particles = useRef(
    Array.from({length: 1000}).map(() => {
      const d = Math.random() * 2 * Math.PI;
      const s = Math.random() * S + S * 0.5;
      return {
        text: foods[Math.floor(Math.random() * foods.length)],
        x: 0.5,
        y: 0.5,
        vx: Math.cos(d) * s,
        vy: Math.sin(d) * s,
      };
    }),
  ).current;

  return (
    <TestCanvas
      w={w}
      h={h}
      draw={(ctx) => {
        for (const p of particles) {
          ctx.save();
          ctx.translate(p.x * w, p.y * h);
          drawStyledText(ctx, p.text, 0, 0);
          ctx.restore();

          p.x += p.vx;
          p.y += p.vy;
          if ((p.x < 0 && p.vx < 0) || (p.x > 1 && p.vx > 0)) p.vx *= -1;
          if ((p.y < 0 && p.vy < 0) || (p.y > 1 && p.vy > 0)) p.vy *= -1;
        }
      }}
    />
  );
};
PerformanceTest.storyName = 'Caching: Performance test';
PerformanceTest.meta = {
  snapshotTest: false,
};

export const PrestyledCachedText: Story = () => {
  const baseStyle = useMemo(
    () =>
      ({
        font: '64px sans-serif',
        baseline: 'hanging',
        align: 'left',
      }) satisfies StyledTextStyle,
    [],
  );

  const comparisonText = useMemo(
    () =>
      new PrestyledText('Hello cache!', {
        ...baseStyle,
        fill: 'rgba(0,255,0,1)',
      }),
    [baseStyle],
  );

  return (
    <TestCanvas
      w={w}
      h={h}
      draw={(ctx) => {
        ctx.globalCompositeOperation = 'multiply';
        drawStyledText(ctx, comparisonText, 64, 64);
        drawStyledText(ctx, 'Hello cache!', 64, 64, {
          ...baseStyle,
          fill: 'rgba(255,0,0,1)',
        });
        ctx.globalCompositeOperation = 'source-over';
      }}
    />
  );
};
PrestyledCachedText.storyName = 'Caching: Prestyled text';

export const PrestyledDecorations: Story = () => {
  const shadowText = useMemo(
    () =>
      new PrestyledText('Hello cache!', {
        font: '64px sans-serif',
        baseline: 'hanging',
        align: 'left',
        shadowBlur: 16,
        shadowOffsetY: 8,
        shadowColor: 'purple',
      }),
    [],
  );

  const strokeText = useMemo(
    () =>
      new PrestyledText('Hello cache!', {
        font: '64px sans-serif',
        baseline: 'hanging',
        align: 'left',
        fill: 'white',
        stroke: 'purple',
        strokeWidth: 2,
      }),
    [],
  );

  return (
    <TestCanvas
      w={w}
      h={h}
      draw={(ctx) => {
        drawStyledText(ctx, shadowText, 64, 64);
        drawStyledText(ctx, strokeText, 64, 128);
      }}
    />
  );
};
PrestyledDecorations.storyName = 'Caching: Prestyled decorations';

export const PrestyledTransforms: Story = () => {
  const text = useMemo(
    () =>
      new PrestyledText('Transform!', {
        font: '32px sans-serif',
        baseline: 'middle',
        align: 'center',
      }),
    [],
  );

  return (
    <TestCanvas
      w={w}
      h={h}
      draw={(ctx) => {
        ctx.save();
        ctx.translate((w * 1) / 3, (h * 1) / 4);
        ctx.rotate(0);
        drawStyledText(ctx, text, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate((w * 1) / 3, (h * 2) / 4);
        ctx.rotate(0.25);
        drawStyledText(ctx, text, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate((w * 2) / 3, (h * 1) / 4);
        ctx.scale(0.5, 0.5);
        drawStyledText(ctx, text, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate((w * 2) / 3, (h * 2) / 4);
        ctx.scale(1.5, 1.5);
        drawStyledText(ctx, text, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate((w * 2) / 3, (h * 3) / 4);
        ctx.scale(2, 2);
        ctx.rotate(0.25);
        drawStyledText(ctx, text, 0, 0);
        ctx.restore();
      }}
    />
  );
};
PrestyledTransforms.storyName = 'Caching: Prestyled transforms';

export const PrestyledScaling: Story = () => {
  const text = useMemo(
    () =>
      new PrestyledText('Transform!', {
        font: '32px sans-serif',
        baseline: 'middle',
        align: 'center',
      }),
    [],
  );

  return (
    <TestCanvas
      w={w}
      h={h}
      draw={(ctx) => {
        const t = Date.now() / 1000;
        ctx.save();
        ctx.translate(w / 2, h / 2);
        const s = Math.sin(t) * 3;
        ctx.scale(s, s);
        drawStyledText(ctx, text, 0, 0);
        ctx.restore();
      }}
    />
  );
};
PrestyledScaling.storyName = 'Caching: Prestyled scaling';
PrestyledScaling.meta = {
  snapshotTest: false,
};
