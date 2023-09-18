import {LRUCache} from './LRUCache';
import {StyledText, StyledTextSpan, StyledTextStyle} from './types';
import {
  aggregateLineMetrics,
  getLineSpans,
  measureLine,
  MeasureLineResult,
  normalizeStyledText,
} from './util';

type FullTextMetrics = {
  spans: Array<StyledTextSpan>;
  lines: Array<Array<StyledTextSpan>>;
  linesMetrics: Array<MeasureLineResult>;
  textMetrics: TextMetrics;
};
export class TextMetricsCache {
  private lru: LRUCache<string, FullTextMetrics>;

  constructor(capacity: number = 256) {
    this.lru = new LRUCache(capacity);
  }

  measureStyledText(
    ctx: CanvasRenderingContext2D,
    text: StyledText,
    style: StyledTextStyle,
  ): FullTextMetrics {
    const key = JSON.stringify({text, style});
    let result = this.lru.get(key);
    if (!result) {
      const spans = normalizeStyledText(text);
      const lines = getLineSpans(spans);
      const linesMetrics = lines.map((line) => measureLine(ctx, line, style));
      const textMetrics = aggregateLineMetrics(linesMetrics);
      result = {spans, lines, linesMetrics, textMetrics};
      this.lru.put(key, result);
    }
    return result;
  }
}
