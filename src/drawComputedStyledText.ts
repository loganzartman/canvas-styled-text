import {StyledTextStyle} from './types';
import {
  computeLengthPx,
  ExperimentalContext,
  FullTextMetrics,
  hasStroke,
  normalizedTextAlign,
  style,
} from './util';

export const drawComputedStyledText = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  baseStyle: Required<StyledTextStyle>,
  metrics: FullTextMetrics,
) => {
  ctx.save();
  ctx.translate(x, y);

  const {lines, linesMetrics} = metrics;
  const desiredTextAlign = baseStyle.align;
  const align = normalizedTextAlign(
    desiredTextAlign,
    style('direction', baseStyle),
  );
  ctx.textAlign = 'left';
  ctx.textBaseline = baseStyle.baseline;

  let yStart = 0;

  for (let l = 0; l < lines.length; ++l) {
    const line = lines[l];
    const {lineMetrics, spanMetrics, lineHeightPx} = linesMetrics[l];
    const lineCenter =
      0.5 *
      (lineMetrics.fontBoundingBoxDescent - lineMetrics.fontBoundingBoxAscent);

    if (l > 0) {
      yStart += lineHeightPx * 0.5;
    }

    let xStart: number;
    if (align === 'left') {
      xStart = 0;
    } else if (align === 'center') {
      xStart = -lineMetrics.width / 2;
    } else if (align === 'right') {
      xStart = -lineMetrics.width;
    } else {
      throw new Error('Invalid align');
    }

    for (let s = 0; s < line.length; ++s) {
      const span = line[s];
      const m = spanMetrics[s];
      const spanCenter =
        0.5 * (m.fontBoundingBoxDescent - m.fontBoundingBoxAscent);
      const verticalPos = lineCenter - spanCenter;

      ctx.save();
      const top = computeLengthPx(style('top', span.style, baseStyle), m);
      const scale = style('scale', span.style, baseStyle);
      ctx.translate(xStart, yStart + top + verticalPos);
      ctx.font = style('font', span.style, baseStyle);
      ctx.fontKerning = style('fontKerning', span.style, baseStyle);
      (ctx as ExperimentalContext).fontStretch = style(
        'fontStretch',
        span.style,
        baseStyle,
      );
      ctx.fillStyle = style('fill', span.style, baseStyle);
      ctx.shadowBlur = style('shadowBlur', span.style, baseStyle);
      ctx.shadowColor = style('shadowColor', span.style, baseStyle);
      ctx.shadowOffsetX = style('shadowOffsetX', span.style, baseStyle);
      ctx.shadowOffsetY = style('shadowOffsetY', span.style, baseStyle);
      ctx.scale(scale, scale);
      ctx.fillText(span.text, 0, 0);
      if (hasStroke(span.style, baseStyle)) {
        ctx.strokeStyle = style('stroke', span.style, baseStyle);
        ctx.lineWidth = style('strokeWidth', span.style, baseStyle);
        ctx.strokeText(span.text, 0, 0);
      }
      ctx.restore();
      xStart += m.width;
    }

    yStart += lineHeightPx * 0.5;
  }

  ctx.restore();
};
