export type TextMetricsExtended = TextMetrics & {
  emHeightAscent: number;
  emHeightDescent: number;
};

const computedStyleCache: WeakMap<
  HTMLElement,
  [HTMLElement, CSSStyleDeclaration]
> = new WeakMap();

export const computeFontSizePx = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
): number => {
  // an alternative to this is parsing ctx.font, but I wanted to support relative units like `em`.
  // fundamentally, we have to use getComputedStyle for that.

  const root =
    ctx instanceof CanvasRenderingContext2D ? ctx.canvas : document.body;
  let cached = computedStyleCache.get(root);

  if (!cached) {
    const el = document.createElement('div');
    el.ariaHidden = 'true';
    el.style.display = 'none';
    root.appendChild(el);
    cached = [el, window.getComputedStyle(el)];
    computedStyleCache.set(root, cached);
  }

  const [el, computed] = cached;
  el.style.font = ctx.font;
  return Number.parseFloat(computed.fontSize);
};

const approximateEmMetrics = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  metrics: TextMetrics | TextMetricsExtended,
): TextMetricsExtended => {
  if ('emHeightAscent' in metrics && 'emHeightDescent' in metrics) {
    return metrics;
  }

  const fontSize = computeFontSizePx(ctx);
  const {textBaseline} = ctx;
  let emHeightAscent: number;
  let emHeightDescent: number;

  if (
    textBaseline === 'bottom' ||
    textBaseline === 'alphabetic' ||
    textBaseline === 'ideographic'
  ) {
    // this is only correct for 'bottom', it's a rough approximation for the others.
    emHeightAscent = fontSize;
    emHeightDescent = 0;
  } else if (textBaseline === 'middle') {
    emHeightAscent = fontSize / 2;
    emHeightDescent = fontSize / 2;
  } else if (textBaseline === 'hanging' || textBaseline === 'top') {
    // this is only correct for 'top', it's a rough approximation for 'hanging'.
    emHeightAscent = 0;
    emHeightDescent = fontSize;
  } else {
    throw new Error(`Unsupported textBaseline: ${textBaseline}`);
  }

  return {
    actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
    actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
    actualBoundingBoxLeft: metrics.actualBoundingBoxLeft,
    actualBoundingBoxRight: metrics.actualBoundingBoxRight,
    fontBoundingBoxAscent: metrics.fontBoundingBoxAscent,
    fontBoundingBoxDescent: metrics.fontBoundingBoxDescent,
    width: metrics.width,
    emHeightAscent,
    emHeightDescent,
  };
};

// this whole thing is a hack until browsers support TextMetrics.emHeightAscent and emHeightDescent
// TODO: once widespread support for TextMetrics.emHeightAscent/Descent are available, remove this.
export const measureTextExtended = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
): TextMetricsExtended => approximateEmMetrics(ctx, ctx.measureText(text));
