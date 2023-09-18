export class LRUCache<K, V> {
  readonly capacity: number;
  private cache: Map<K, V> = new Map();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    const v = this.cache.get(key);
    if (typeof v === 'undefined') {
      return undefined;
    }
    this.cache.delete(key);
    this.cache.set(key, v);
    return v;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);

    if (this.cache.size > this.capacity) {
      const leastRecent = this.cache.keys().next().value;
      this.cache.delete(leastRecent);
    }
  }
}
