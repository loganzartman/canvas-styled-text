export type Length = number | {value: number; unit: 'px' | '%'};

export type StyledTextSpanStyle = {
  fill?: string | CanvasGradient | CanvasPattern;
  font?: string;
  fontKerning?: CanvasFontKerning;
  fontStretch?: CanvasFontStretch;
  lineHeight?: Length;
  scale?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  stroke?: string | CanvasGradient | CanvasPattern;
  strokeWidth?: number;
  top?: Length;
};

export type StyledTextStyle = StyledTextSpanStyle & {
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  direction?: 'ltr' | 'rtl';
};

export type StyledTextSpan = {text: string; style?: StyledTextSpanStyle};

export type StyledText =
  | string
  | StyledTextSpan
  | Array<string | StyledTextSpan>;
