import {
  Length,
  StyledText,
  StyledTextSpan,
  StyledTextStyle,
  TextMetricsShape,
} from './types';

const transparentBlack = 'rgb(0 0 0 / 0%)';

export type ExperimentalContext = CanvasRenderingContext2D & {
  fontStretch: CanvasFontStretch;
};

export type MeasureLineResult = {
  lineMetrics: TextMetricsShape;
  spanMetrics: Array<TextMetricsShape>;
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
    fill: style?.fill ?? ctx?.fillStyle ?? '#000000',
    stroke: style?.stroke ?? ctx?.strokeStyle ?? transparentBlack,
    strokeWidth: style?.strokeWidth ?? ctx?.lineWidth ?? 0,
    font: style?.font ?? ctx?.font ?? '10px sans-serif',
    fontKerning: style?.fontKerning ?? ctx?.fontKerning ?? 'auto',
    fontStretch:
      style?.fontStretch ??
      (ctx as ExperimentalContext | undefined)?.fontStretch ??
      'normal',
    top: style?.top ?? 0,
    scale: style?.scale ?? 1,
    direction: style?.direction ?? normalizedDirection(ctx) ?? 'ltr',
    shadowBlur: style?.shadowBlur ?? ctx?.shadowBlur ?? 0,
    shadowColor: style?.shadowColor ?? ctx?.shadowColor ?? transparentBlack,
    shadowOffsetX: style?.shadowOffsetX ?? ctx?.shadowOffsetX ?? 0,
    shadowOffsetY: style?.shadowOffsetY ?? ctx?.shadowOffsetY ?? 0,
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

type EnhancedTextMetrics = TextMetrics & {
  paddingLeft?: number;
  paddingRight?: number;
};

export const measureLine = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  line: Array<StyledTextSpan>,
  baseStyle: Required<StyledTextStyle>,
): MeasureLineResult => {
  ctx.save();

  // always measure in left LTR, otherwise horizontal measurements are ambiguous.
  // alignment is corrected per-line.
  // use the real baseline; it gives us distinct actual- and font- measurements.
  const desiredTextAlign = baseStyle.align;
  ctx.textAlign = 'left';
  ctx.direction = 'ltr';
  ctx.textBaseline = baseStyle.baseline;

  const lineMetrics: TextMetricsShape = {
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    fontBoundingBoxAscent: 0,
    fontBoundingBoxDescent: 0,
    width: 0,
  };

  const spanMetrics = line.map((span, i) => {
    ctx.font = style('font', span.style, baseStyle);
    ctx.fontKerning = style('fontKerning', span.style, baseStyle);
    (ctx as ExperimentalContext).fontStretch = style(
      'fontStretch',
      span.style,
      baseStyle,
    );
    const scale = style('scale', span.style, baseStyle);
    const result = ctx.measureText(span.text);
    const spanResult = {
      actualBoundingBoxAscent: result.actualBoundingBoxAscent * scale,
      actualBoundingBoxDescent: result.actualBoundingBoxDescent * scale,
      actualBoundingBoxLeft: result.actualBoundingBoxLeft * scale,
      actualBoundingBoxRight: result.actualBoundingBoxRight * scale,
      fontBoundingBoxAscent: result.fontBoundingBoxAscent * scale,
      fontBoundingBoxDescent: result.fontBoundingBoxDescent * scale,
      width: result.width * scale,
    } as EnhancedTextMetrics;
    if (i === 0) {
      spanResult.paddingLeft = result.actualBoundingBoxLeft;
    }
    if (i === line.length - 1) {
      ctx.textAlign = 'right';
      const rightResult = ctx.measureText(span.text);
      spanResult.paddingRight = rightResult.actualBoundingBoxRight;
      ctx.textAlign = 'left';
    }
    return spanResult;
  });

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
  }

  const align = normalizedTextAlign(
    desiredTextAlign,
    style('direction', baseStyle),
  );

  const firstSpan = spanMetrics[0];
  const lastSpan = spanMetrics[spanMetrics.length - 1];
  if (align === 'left') {
    lineMetrics.actualBoundingBoxLeft = firstSpan.paddingLeft!;
    lineMetrics.actualBoundingBoxRight =
      lineMetrics.width + lastSpan.paddingRight!;
  } else if (align === 'center') {
    lineMetrics.actualBoundingBoxLeft =
      lineMetrics.width / 2 + firstSpan.paddingLeft!;
    lineMetrics.actualBoundingBoxRight =
      lineMetrics.width / 2 + lastSpan.paddingRight!;
  } else if (align === 'right') {
    lineMetrics.actualBoundingBoxLeft =
      lineMetrics.width + firstSpan.paddingLeft!;
    lineMetrics.actualBoundingBoxRight = lastSpan.paddingRight!;
  } else {
    throw new Error('invalid align');
  }

  ctx.restore();
  return {lineMetrics, spanMetrics};
};

export const aggregateLineMetrics = (
  linesMetrics: Array<MeasureLineResult>,
): TextMetrics => {
  const metrics = {
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    fontBoundingBoxAscent: 0,
    fontBoundingBoxDescent: 0,
    width: 0,
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
  for (let i = 0; i < linesMetrics.length; ++i) {
    const m = linesMetrics[i].lineMetrics;
    if (i < linesMetrics.length - 1) {
      const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      metrics.actualBoundingBoxDescent += h;
      metrics.fontBoundingBoxDescent += h;
    }
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
  metrics.actualBoundingBoxDescent +=
    linesMetrics[linesMetrics.length - 1].lineMetrics.actualBoundingBoxDescent;
  metrics.fontBoundingBoxDescent +=
    linesMetrics[linesMetrics.length - 1].lineMetrics.fontBoundingBoxDescent;

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
