export type Length = number | {value: number; unit: 'px' | '%'};

export type StyledTextSpanStyle = {
  fill?: string | CanvasGradient | CanvasPattern;
  stroke?: string | CanvasGradient | CanvasPattern;
  strokeWidth?: number;
  font?: string;
  top?: Length;
  scale?: number;
};

export type StyledTextStyle = StyledTextSpanStyle & {
  direction?: 'ltr' | 'rtl';
};

export type StyledTextSpan = {text: string; style?: StyledTextSpanStyle};

export type StyledText = string | StyledTextSpan | Array<StyledTextSpan>;

export type TextMetricsShape = {
  -readonly [key in keyof TextMetrics]: TextMetrics[key];
};
