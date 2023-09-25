import {drawComputedStyledText} from './drawComputedStyledText';
import {StyledText, StyledTextStyle} from './types';
import {
  computeFullTextMetrics,
  extendContextStyles,
  FullTextMetrics,
} from './util';

type DrawMetrics = {
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
};

const extractScale = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
) => {
  const mat = ctx.getTransform();
  if (!mat.is2D) throw new Error('expected 2D matrix!');

  // this can be derived by applying the matrix to X and Y unit vectors and computing their length
  const scaleX = Math.sqrt(mat.a ** 2 + mat.b ** 2);
  const scaleY = Math.sqrt(mat.c ** 2 + mat.d ** 2);

  return [scaleX, scaleY];
};

const computeDrawMetrics = (
  scaleX: number,
  scaleY: number,
  metrics: TextMetrics,
  style: Required<StyledTextStyle>,
): DrawMetrics => {
  const paddingLeft =
    (Math.max(
      0,
      -style.shadowOffsetX + style.shadowBlur + (style.strokeWidth ?? 0),
    ) +
      1) *
    scaleX;
  const paddingRight =
    Math.max(
      0,
      style.shadowOffsetX + style.shadowBlur + (style.strokeWidth ?? 0),
    ) * scaleX;
  const paddingTop =
    (Math.max(
      0,
      -style.shadowOffsetY + style.shadowBlur + (style.strokeWidth ?? 0),
    ) +
      1) *
    scaleY;

  const paddingBottom =
    Math.max(
      0,
      style.shadowOffsetY + style.shadowBlur + (style.strokeWidth ?? 0),
    ) * scaleY;
  const width =
    (metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight + 2) *
      scaleX +
    paddingLeft +
    paddingRight;
  const height =
    (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 2) *
      scaleY +
    paddingTop +
    paddingBottom;

  return {
    scaleX,
    scaleY,
    paddingLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    width,
    height,
  };
};

export class PrestyledText {
  readonly text: StyledText;
  readonly baseStyle: Required<StyledTextStyle>;
  scaleTolerance: number;
  private dirty: boolean = true;
  private _firstScale: boolean = true;
  private _scaleX: number = 1;
  private _scaleY: number = 1;
  private _ctx: OffscreenCanvasRenderingContext2D | undefined;
  private _metrics: FullTextMetrics | undefined;
  private _drawMetrics: DrawMetrics | undefined;

  constructor(
    text: StyledText,
    baseStyle?: StyledTextStyle,
    {scaleTolerance = 1.25}: {scaleTolerance?: number} = {},
  ) {
    this.text = text;
    this.baseStyle = extendContextStyles(undefined, baseStyle);
    this.scaleTolerance = scaleTolerance;
  }

  private get ctx(): OffscreenCanvasRenderingContext2D {
    if (!this._ctx) {
      const ctx = new OffscreenCanvas(0, 0).getContext('2d');
      if (!ctx) throw new Error('Failed to get 2D context');
      this._ctx = ctx;
    }
    return this._ctx;
  }

  get metrics(): Readonly<FullTextMetrics> {
    if (!this._metrics) {
      this.ctx.save();
      this.ctx.scale(this._scaleX, this._scaleY);
      this._metrics = computeFullTextMetrics(
        this.ctx,
        this.text,
        this.baseStyle,
      );
      this.ctx.restore();
    }
    return this._metrics;
  }

  private get drawMetrics(): DrawMetrics {
    if (!this._drawMetrics) {
      this._drawMetrics = computeDrawMetrics(
        this._scaleX,
        this._scaleY,
        this.metrics.textMetrics,
        this.baseStyle,
      );
    }
    return this._drawMetrics;
  }

  private updateRenderScale(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  ): void {
    const [newX, newY] = extractScale(ctx);
    if (
      this._firstScale ||
      Math.max(newX, this._scaleX) / Math.min(newX, this._scaleX) >
        this.scaleTolerance ||
      Math.max(newY, this._scaleY) / Math.min(newY, this._scaleY) >
        this.scaleTolerance
    ) {
      this._firstScale = false;
      this._scaleX = newX;
      this._scaleY = newY;
      this.invalidate();
    }
  }

  invalidate(): void {
    this._metrics = undefined;
    this._drawMetrics = undefined;
    this.dirty = true;
  }

  prerender(): PrestyledText {
    if (!this.dirty) {
      return this;
    }

    const ctx = this.ctx;
    const canvas = this.ctx.canvas;
    const metrics = this.metrics;
    const drawMetrics = this.drawMetrics;
    canvas.width = drawMetrics.width;
    canvas.height = drawMetrics.height;

    ctx.translate(drawMetrics.paddingLeft, drawMetrics.paddingTop);
    ctx.scale(drawMetrics.scaleX, drawMetrics.scaleY);
    ctx.translate(
      metrics.textMetrics.actualBoundingBoxLeft,
      metrics.textMetrics.actualBoundingBoxAscent,
    );

    drawComputedStyledText(ctx, 0, 0, this.baseStyle, metrics);

    this.dirty = false;
    return this;
  }

  drawTo(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    x: number,
    y: number,
  ): void {
    this.updateRenderScale(ctx);
    this.prerender();
    if (this.ctx.canvas.width === 0 || this.ctx.canvas.height === 0) return;

    const metrics = this.metrics;
    const drawMetrics = this.drawMetrics;
    ctx.save();
    ctx.translate(
      x - metrics.textMetrics.actualBoundingBoxLeft,
      y - metrics.textMetrics.actualBoundingBoxAscent,
    );
    ctx.scale(1 / drawMetrics.scaleX, 1 / drawMetrics.scaleY);
    ctx.translate(-drawMetrics.paddingLeft, -drawMetrics.paddingTop);
    ctx.drawImage(this.ctx.canvas, 0, 0);
    ctx.restore();
  }
}
