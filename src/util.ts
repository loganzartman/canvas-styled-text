import {measureTextExtended, TextMetricsExtended} from './measureTextExtended';
import {Length, StyledText, StyledTextSpan, StyledTextStyle} from './types';

const transparentBlack = 'rgb(0 0 0 / 0%)';

export type TextMetricsExtendedShape = {
  -readonly [key in keyof TextMetricsExtended]: TextMetricsExtended[key];
};

export type ExperimentalContext = CanvasRenderingContext2D & {
  fontStretch: CanvasFontStretch;
};

export type MeasureLineResult = {
  lineMetrics: TextMetricsExtendedShape;
  spanMetrics: Array<TextMetricsExtendedShape>;
  lineHeightPx: number;
};

export type FullTextMetrics = {
  spans: Array<StyledTextSpan>;
  lines: Array<Array<StyledTextSpan>>;
  linesMetrics: Array<MeasureLineResult>;
  textMetrics: TextMetrics;
};

export const computeLengthPx = (
  length: Length,
  textMetrics: TextMetrics,
): number => {
  if (typeof length === 'number') {
    return length;
  } else if (length.unit === 'px') {
    return length.value;
  } else if (length.unit === '%') {
    return (
      (length.value / 100) *
      (textMetrics.actualBoundingBoxAscent +
        textMetrics.actualBoundingBoxDescent)
    );
  }
  throw new Error('Invalid length');
};

export const stringifyLength = (length: Length) =>
  typeof length === 'number' ? String(length) : `${length.value}${length.unit}`;

export const computeLineHeightPx = (
  height: Length,
  emHeight: number,
): number => {
  if (typeof height === 'number') {
    return height * emHeight;
  } else if (height.unit === '%') {
    return (height.value / 100) * emHeight;
  } else if (height.unit === 'px') {
    return height.value;
  } else {
    throw new Error(`Unsupported length type for line height: ${height}`);
  }
};

const normalizedDirection = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | undefined,
): 'ltr' | 'rtl' | undefined => {
  if (!ctx) return undefined;
  const {direction} = ctx;
  if (direction === 'inherit') {
    if (ctx.canvas instanceof OffscreenCanvas) {
      return undefined;
    } else {
      const direction = window.getComputedStyle(ctx.canvas).direction;
      if (direction !== 'ltr' && direction !== 'rtl') {
        throw new Error(
          `Canvas has invalid direction '${direction}'; try setting a direction manually.`,
        );
      }
      return direction;
    }
  } else {
    return direction;
  }
};

export const extendContextStyles = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | undefined,
  style: StyledTextStyle | undefined,
): Required<StyledTextStyle> => {
  return {
    align: style?.align ?? ctx?.textAlign ?? 'start',
    baseline: style?.baseline ?? ctx?.textBaseline ?? 'alphabetic',
    direction: style?.direction ?? normalizedDirection(ctx) ?? 'ltr',
    fill: style?.fill ?? ctx?.fillStyle ?? '#000000',
    font: style?.font ?? ctx?.font ?? '10px sans-serif',
    fontKerning: style?.fontKerning ?? ctx?.fontKerning ?? 'auto',
    fontStretch:
      style?.fontStretch ??
      (ctx as ExperimentalContext | undefined)?.fontStretch ??
      'normal',
    lineHeight: style?.lineHeight ?? 1.2,
    scale: style?.scale ?? 1,
    shadowBlur: style?.shadowBlur ?? ctx?.shadowBlur ?? 0,
    shadowColor: style?.shadowColor ?? ctx?.shadowColor ?? transparentBlack,
    shadowOffsetX: style?.shadowOffsetX ?? ctx?.shadowOffsetX ?? 0,
    shadowOffsetY: style?.shadowOffsetY ?? ctx?.shadowOffsetY ?? 0,
    stroke: style?.stroke ?? ctx?.strokeStyle ?? transparentBlack,
    strokeWidth: style?.strokeWidth ?? ctx?.lineWidth ?? 0,
    top: style?.top ?? 0,
  };
};

export const normalizeStyledText = (
  text: StyledText,
): Array<StyledTextSpan> => {
  if (!Array.isArray(text)) {
    text = [text];
  }
  return text.map((item) => (typeof item === 'string' ? {text: item} : item));
};

const splitLines = (s: string): Array<string> => s.split(/\r\n|\r|\n/g);

export const getLineSpans = (
  spans: Array<StyledTextSpan>,
): Array<Array<StyledTextSpan>> => {
  const lines: Array<Array<StyledTextSpan>> = [];
  let lineSpans: Array<StyledTextSpan> = [];
  for (const span of spans) {
    const spanLines = splitLines(span.text);
    for (let i = 0; i < spanLines.length; ++i) {
      const lineText = spanLines[i];
      if (i > 0) {
        lines.push(lineSpans);
        lineSpans = [];
      }
      lineSpans.push({text: lineText, style: span.style});
    }
  }
  if (lineSpans.length > 0) {
    lines.push(lineSpans);
  }
  return lines;
};

export const style = <K extends keyof StyledTextStyle>(
  key: K,
  ...styles: Array<StyledTextStyle | null | undefined>
): NonNullable<StyledTextStyle[K]> => {
  for (const style of styles) {
    if (style && key in style) {
      const val = style[key];
      if (typeof val !== 'undefined') return val;
    }
  }
  throw new Error(`missing value for property '${key}'`);
};

export const hasStroke = (
  ...styles: Array<StyledTextStyle | null | undefined>
) => {
  const stroke = style('stroke', ...styles);
  const strokeWidth = style('strokeWidth', ...styles);
  return stroke !== 'transparent' && stroke !== 'none' && strokeWidth > 0;
};

export const normalizedTextAlign = (
  align: CanvasTextAlign,
  direction: 'ltr' | 'rtl',
): 'left' | 'center' | 'right' => {
  if (direction === 'ltr') {
    if (align === 'start') return 'left';
    if (align === 'end') return 'right';
    return align;
  } else if (direction === 'rtl') {
    if (align === 'start') return 'right';
    if (align === 'end') return 'left';
    return align;
  } else {
    throw new Error(`Unsupported direction '${direction}'`);
  }
};

export const measureLine = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  line: Array<StyledTextSpan>,
  baseStyle: Required<StyledTextStyle>,
): MeasureLineResult => {
  ctx.save();

  // always measure in left LTR, otherwise horizontal measurements are ambiguous.
  // alignment is corrected per-line.
  const desiredTextAlign = baseStyle.align;
  ctx.textAlign = 'left';
  ctx.direction = 'ltr';
  ctx.textBaseline = baseStyle.baseline;

  // how much the text overflows the left and right of the line
  let paddingLeft = 0;
  let paddingRight = 0;

  // first, measure individual spans given each of their styles
  const spanMetrics = line.map((span, i) => {
    ctx.font = style('font', span.style, baseStyle);
    ctx.fontKerning = style('fontKerning', span.style, baseStyle);
    (ctx as ExperimentalContext).fontStretch = style(
      'fontStretch',
      span.style,
      baseStyle,
    );

    const scale = style('scale', span.style, baseStyle);
    const result = measureTextExtended(ctx, span.text);
    const spanResult = {
      actualBoundingBoxAscent: result.actualBoundingBoxAscent * scale,
      actualBoundingBoxDescent: result.actualBoundingBoxDescent * scale,
      actualBoundingBoxLeft: result.actualBoundingBoxLeft * scale,
      actualBoundingBoxRight: result.actualBoundingBoxRight * scale,
      fontBoundingBoxAscent: result.fontBoundingBoxAscent * scale,
      fontBoundingBoxDescent: result.fontBoundingBoxDescent * scale,
      width: result.width * scale,
      emHeightAscent: result.emHeightAscent * scale,
      emHeightDescent: result.emHeightDescent * scale,
    };

    if (i === 0) {
      paddingLeft = result.actualBoundingBoxLeft;
    }

    if (i === line.length - 1) {
      ctx.textAlign = 'right';
      const rightResult = ctx.measureText(span.text);
      paddingRight = rightResult.actualBoundingBoxRight;
      ctx.textAlign = 'left';
    }

    return spanResult;
  });

  // next, aggregate spans into a single metrics object representing the whole line,
  // as if it were a single run of text.
  const lineMetrics: TextMetricsExtendedShape = {
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    fontBoundingBoxAscent: 0,
    fontBoundingBoxDescent: 0,
    width: 0,
    emHeightAscent: 0,
    emHeightDescent: 0,
  };
  if (line.length === 0) {
    return {lineMetrics, spanMetrics, lineHeightPx: 0};
  }

  // we want to compute the max and negative values are possible; initialization to 0 doesn't work.
  lineMetrics.actualBoundingBoxAscent = -Infinity;
  lineMetrics.actualBoundingBoxDescent = -Infinity;
  lineMetrics.fontBoundingBoxAscent = -Infinity;
  lineMetrics.fontBoundingBoxDescent = -Infinity;
  lineMetrics.emHeightAscent = -Infinity;
  lineMetrics.emHeightDescent = -Infinity;

  for (let i = 0; i < line.length; ++i) {
    const span = line[i];
    const m = spanMetrics[i];
    const top = computeLengthPx(style('top', span.style, baseStyle), m);

    lineMetrics.width += m.width;
    lineMetrics.actualBoundingBoxAscent = Math.max(
      lineMetrics.actualBoundingBoxAscent,
      m.actualBoundingBoxAscent - top,
    );
    lineMetrics.actualBoundingBoxDescent = Math.max(
      lineMetrics.actualBoundingBoxDescent,
      m.actualBoundingBoxDescent + top,
    );
    lineMetrics.fontBoundingBoxAscent = Math.max(
      lineMetrics.fontBoundingBoxAscent,
      m.fontBoundingBoxAscent - top,
    );
    lineMetrics.fontBoundingBoxDescent = Math.max(
      lineMetrics.fontBoundingBoxDescent,
      m.fontBoundingBoxDescent + top,
    );
    lineMetrics.emHeightAscent = Math.max(
      lineMetrics.emHeightAscent,
      m.emHeightAscent - top,
    );
    lineMetrics.emHeightDescent = Math.max(
      lineMetrics.emHeightDescent,
      m.emHeightDescent + top,
    );
  }

  // everything was measured with left alignment.
  // now, adjust for the desired alignment.
  const align = normalizedTextAlign(
    desiredTextAlign,
    style('direction', baseStyle),
  );

  if (align === 'left') {
    lineMetrics.actualBoundingBoxLeft = paddingLeft;
    lineMetrics.actualBoundingBoxRight = lineMetrics.width + paddingRight;
  } else if (align === 'center') {
    lineMetrics.actualBoundingBoxLeft = lineMetrics.width / 2 + paddingLeft;
    lineMetrics.actualBoundingBoxRight = lineMetrics.width / 2 + paddingRight;
  } else if (align === 'right') {
    lineMetrics.actualBoundingBoxLeft = lineMetrics.width + paddingLeft;
    lineMetrics.actualBoundingBoxRight = paddingRight;
  } else {
    throw new Error('invalid align');
  }

  const lineHeight = style('lineHeight', baseStyle);
  const lineHeightPx = computeLineHeightPx(
    lineHeight,
    lineMetrics.emHeightAscent + lineMetrics.emHeightDescent,
  );

  ctx.restore();
  return {lineMetrics, spanMetrics, lineHeightPx};
};

export const aggregateLineMetrics = (
  linesMetrics: Array<MeasureLineResult>,
): TextMetricsExtended => {
  const metrics = {
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    fontBoundingBoxAscent: 0,
    fontBoundingBoxDescent: 0,
    width: 0,
    emHeightAscent: 0,
    emHeightDescent: 0,
  };
  if (linesMetrics.length === 0) {
    return metrics;
  }

  metrics.actualBoundingBoxAscent =
    linesMetrics[0].lineMetrics.actualBoundingBoxAscent;
  metrics.fontBoundingBoxAscent =
    linesMetrics[0].lineMetrics.fontBoundingBoxAscent;
  metrics.actualBoundingBoxLeft =
    linesMetrics[0].lineMetrics.actualBoundingBoxLeft;
  metrics.actualBoundingBoxRight =
    linesMetrics[0].lineMetrics.actualBoundingBoxRight;
  metrics.emHeightAscent = linesMetrics[0].lineMetrics.emHeightAscent;

  for (let i = 0; i < linesMetrics.length; ++i) {
    const {lineHeightPx} = linesMetrics[i];
    const halfH = lineHeightPx * 0.5;
    if (i > 0) {
      metrics.actualBoundingBoxDescent += halfH;
      metrics.fontBoundingBoxDescent += halfH;
      metrics.emHeightDescent += halfH;
    }
    if (i < linesMetrics.length - 1) {
      metrics.actualBoundingBoxDescent += halfH;
      metrics.fontBoundingBoxDescent += halfH;
      metrics.emHeightDescent += halfH;
    }

    const m = linesMetrics[i].lineMetrics;
    metrics.width = Math.max(metrics.width, m.width);
    metrics.actualBoundingBoxLeft = Math.max(
      metrics.actualBoundingBoxLeft,
      m.actualBoundingBoxLeft,
    );
    metrics.actualBoundingBoxRight = Math.max(
      metrics.actualBoundingBoxRight,
      m.actualBoundingBoxRight,
    );
  }

  const lm = linesMetrics[linesMetrics.length - 1];
  metrics.actualBoundingBoxDescent += lm.lineMetrics.actualBoundingBoxDescent;
  metrics.fontBoundingBoxDescent += lm.lineMetrics.fontBoundingBoxDescent;
  metrics.emHeightDescent += lm.lineMetrics.emHeightDescent;

  return metrics;
};

export const computeFullTextMetrics = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: StyledText,
  style: Required<StyledTextStyle>,
): FullTextMetrics => {
  const spans = normalizeStyledText(text);
  const lines = getLineSpans(spans);
  const linesMetrics = lines.map((line) => measureLine(ctx, line, style));
  const textMetrics = aggregateLineMetrics(linesMetrics);
  return {spans, lines, linesMetrics, textMetrics};
};
