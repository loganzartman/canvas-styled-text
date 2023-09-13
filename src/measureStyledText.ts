import {StyledText, StyledTextStyle} from './types';
import {
  aggregateLineMetrics,
  extendContextStyles,
  getLineSpans,
  measureLine,
  normalizeStyledText,
} from './util';

export const measureStyledText = (
  ctx: CanvasRenderingContext2D,
  text: StyledText,
  baseStyle?: StyledTextStyle,
): TextMetrics => {
  ctx.save();
  baseStyle = extendContextStyles(ctx, baseStyle);
  const spans = normalizeStyledText(text);
  const lines = getLineSpans(spans);
  const linesMetrics = lines.map((line) => measureLine(ctx, line, baseStyle));
  const result = aggregateLineMetrics(linesMetrics);
  ctx.restore();
  return result;
};
