export type Length = number | {value: number; unit: 'px' | '%'};

export type StyledTextStyle = {
  fill?: string | CanvasGradient | CanvasPattern;
  stroke?: string | CanvasGradient | CanvasPattern;
  strokeWidth?: number;
  font?: string;
  top?: Length;
  scale?: number;
};

export type StyledTextSpan = {text: string; style?: StyledTextStyle};

export type StyledText = string | StyledTextSpan | Array<StyledTextSpan>;

export type TextMetricsShape = {
  -readonly [key in keyof TextMetrics]: TextMetrics[key];
};
