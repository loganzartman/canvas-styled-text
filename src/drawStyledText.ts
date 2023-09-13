import {StyledText, StyledTextStyle} from './types';
import {
  aggregateLineMetrics,
  computeLengthPx,
  extendContextStyles,
  getLineSpans,
  hasStroke,
  measureLine,
  normalizeStyledText,
  style,
} from './util';

export const drawStyledText = (
  ctx: CanvasRenderingContext2D,
  text: StyledText,
  x: number,
  y: number,
  baseStyle?: StyledTextStyle,
) => {
  ctx.save();
  baseStyle = extendContextStyles(ctx, baseStyle);
  const spans = normalizeStyledText(text);
  const lines = getLineSpans(spans);
  const linesMetrics = lines.map((line) => measureLine(ctx, line, baseStyle));
  const textMetrics = aggregateLineMetrics(linesMetrics);

  const textAlign = ctx.textAlign;
  const textBaseline = ctx.textBaseline;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  let yStart: number;
  if (textBaseline === 'top') {
    yStart = 0;
  } else if (textBaseline === 'middle') {
    yStart =
      -(
        textMetrics.actualBoundingBoxAscent +
        textMetrics.actualBoundingBoxDescent
      ) / 2;
  } else if (textBaseline === 'bottom') {
    yStart = -(
      textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent
    );
  } else {
    throw new Error(`Unsupported textBaseline: ${textBaseline}`);
  }

  for (let l = 0; l < lines.length; ++l) {
    const line = lines[l];
    const {lineMetrics, spanMetrics} = linesMetrics[l];

    let xStart: number;
    if (textAlign === 'left') {
      xStart = 0;
    } else if (textAlign === 'center') {
      xStart = -lineMetrics.width / 2;
    } else if (textAlign === 'right') {
      xStart = -lineMetrics.width;
    } else {
      throw new Error(`Unsupported textAlign: ${textAlign}`);
    }

    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      xStart + x,
      yStart + y,
      lineMetrics.width,
      lineMetrics.actualBoundingBoxAscent +
        lineMetrics.actualBoundingBoxDescent,
    );

    for (let s = 0; s < line.length; ++s) {
      const span = line[s];
      const m = spanMetrics[s];
      const lineCenteringOffset =
        (lineMetrics.actualBoundingBoxAscent +
          lineMetrics.actualBoundingBoxDescent -
          (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent)) *
        0.5;

      ctx.save();
      ctx.font = style('font', span.style, baseStyle);
      ctx.fillStyle = style('fill', span.style, baseStyle);
      const top = computeLengthPx(style('top', span.style, baseStyle), m);
      const scale = style('scale', span.style, baseStyle);
      ctx.translate(x + xStart, y + yStart + top + lineCenteringOffset);
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

    yStart +=
      lineMetrics.actualBoundingBoxAscent +
      lineMetrics.actualBoundingBoxDescent;
  }

  ctx.restore();
};
