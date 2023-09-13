import {
  Length,
  StyledText,
  StyledTextSpan,
  StyledTextStyle,
  TextMetricsShape,
} from './types';

type MeasureLineResult = {
  lineMetrics: TextMetricsShape;
  spanMetrics: Array<TextMetricsShape>;
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

export const extendContextStyles = (
  ctx: CanvasRenderingContext2D,
  style: StyledTextStyle | undefined,
): StyledTextStyle => {
  return {
    fill: ctx.fillStyle,
    stroke: ctx.strokeStyle,
    strokeWidth: ctx.lineWidth,
    font: ctx.font,
    top: 0,
    scale: 1,
    ...style,
  };
};

export const normalizeStyledText = (
  text: StyledText,
): Array<StyledTextSpan> => {
  if (typeof text === 'string') {
    return [{text}];
  }
  if (Array.isArray(text)) {
    return text;
  }
  return [text];
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

export const measureLine = (
  ctx: CanvasRenderingContext2D,
  line: Array<StyledTextSpan>,
  baseStyle: StyledTextStyle | null | undefined,
): MeasureLineResult => {
  ctx.save();
  const lineMetrics: TextMetricsShape = {
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    fontBoundingBoxAscent: 0,
    fontBoundingBoxDescent: 0,
    width: 0,
  };

  const spanMetrics = line.map((span) => {
    ctx.font = style('font', span.style, baseStyle);
    const scale = style('scale', span.style, baseStyle);
    const result = ctx.measureText(span.text);
    return {
      actualBoundingBoxAscent: result.actualBoundingBoxAscent * scale,
      actualBoundingBoxDescent: result.actualBoundingBoxDescent * scale,
      actualBoundingBoxLeft: result.actualBoundingBoxLeft * scale,
      actualBoundingBoxRight: result.actualBoundingBoxRight * scale,
      fontBoundingBoxAscent: result.fontBoundingBoxAscent * scale,
      fontBoundingBoxDescent: result.fontBoundingBoxDescent * scale,
      width: result.width * scale,
    } as TextMetrics;
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
  for (let i = 0; i < linesMetrics.length; ++i) {
    const m = linesMetrics[i].lineMetrics;
    if (i < linesMetrics.length - 1) {
      const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      metrics.actualBoundingBoxDescent += h;
      metrics.fontBoundingBoxDescent += h;
    }
    metrics.width = Math.max(metrics.width, m.width);
  }
  metrics.actualBoundingBoxDescent +=
    linesMetrics[linesMetrics.length - 1].lineMetrics.actualBoundingBoxDescent;
  metrics.fontBoundingBoxDescent +=
    linesMetrics[linesMetrics.length - 1].lineMetrics.fontBoundingBoxDescent;

  return metrics;
};
