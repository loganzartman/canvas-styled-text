import {drawComputedStyledText} from './drawComputedStyledText';
import {PrestyledText} from './prestyledText';
import {StyledText, StyledTextStyle} from './types';
import {computeFullTextMetrics, extendContextStyles} from './util';

export function drawStyledText(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: StyledText,
  x: number,
  y: number,
  baseStyle?: StyledTextStyle,
): void;
export function drawStyledText(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: PrestyledText,
  x: number,
  y: number,
): void;
export function drawStyledText(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: PrestyledText | StyledText,
  x: number,
  y: number,
  baseStyle?: StyledTextStyle,
) {
  if (text instanceof PrestyledText) {
    text.drawTo(ctx, x, y);
  } else {
    const style = extendContextStyles(ctx, baseStyle);
    const metrics = computeFullTextMetrics(ctx, text, style);
    drawComputedStyledText(ctx, x, y, style, metrics);
  }
}
