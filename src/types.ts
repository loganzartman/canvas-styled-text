export type Length = number | {value: number; unit: 'px' | '%'};

export type StyledTextSpanStyle = {
  fill?: string | CanvasGradient | CanvasPattern;
  stroke?: string | CanvasGradient | CanvasPattern;
  strokeWidth?: number;
  font?: string;
  fontKerning?: CanvasFontKerning;
  fontStretch?: CanvasFontStretch;
  top?: Length;
  scale?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowColor?: string;
};

export type StyledTextStyle = StyledTextSpanStyle & {
  direction?: 'ltr' | 'rtl';
};

export type StyledTextSpan = {text: string; style?: StyledTextSpanStyle};

export type StyledText =
  | string
  | StyledTextSpan
  | Array<string | StyledTextSpan>;

export type TextMetricsShape = {
  -readonly [key in keyof TextMetrics]: TextMetrics[key];
};
