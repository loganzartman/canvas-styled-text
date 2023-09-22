import {StyledText, StyledTextStyle} from './types';
import {
  computeFullTextMetrics,
  computeLengthPx,
  extendContextStyles,
  hasStroke,
  normalizedTextAlign,
  style,
} from './util';

export const drawStyledText = (
  ctx: CanvasRenderingContext2D,
  text: StyledText,
  x: number,
  y: number,
  baseStyle?: StyledTextStyle,
) => {
  baseStyle = extendContextStyles(ctx, baseStyle);
  const metrics = computeFullTextMetrics(ctx, text, baseStyle);

  ctx.save();
  ctx.translate(x, y);

  const {lines, linesMetrics} = metrics;
  const desiredTextAlign = ctx.textAlign;
  const align = normalizedTextAlign(
    desiredTextAlign,
    style('direction', baseStyle),
  );
  ctx.textAlign = 'left';

  let yStart = 0;

  for (let l = 0; l < lines.length; ++l) {
    const line = lines[l];
    const {lineMetrics, spanMetrics} = linesMetrics[l];
    const lineCenter =
      0.5 *
      (lineMetrics.fontBoundingBoxDescent - lineMetrics.fontBoundingBoxAscent);

    if (l > 0) {
      yStart += lineMetrics.actualBoundingBoxAscent;
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
      ctx.fillStyle = style('fill', span.style, baseStyle);
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

    yStart += lineMetrics.actualBoundingBoxDescent;
  }

  ctx.restore();
};
