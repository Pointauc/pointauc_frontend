export class ExpiringSet<TValue> {
  private readonly expiresAtByValue = new Map<TValue, number>();

  constructor(
    private readonly limit: number,
    private readonly ttlMs: number,
  ) {}

  has(value: TValue): boolean {
    this.deleteExpired();
    return this.expiresAtByValue.has(value);
  }

  add(value: TValue): void {
    this.deleteExpired();

    if (this.expiresAtByValue.size >= this.limit) {
      const oldestValue = this.expiresAtByValue.keys().next().value as TValue | undefined;
      if (oldestValue !== undefined) {
        this.expiresAtByValue.delete(oldestValue);
      }
    }

    this.expiresAtByValue.set(value, Date.now() + this.ttlMs);
  }

  clear(): void {
    this.expiresAtByValue.clear();
  }

  private deleteExpired(): void {
    const now = Date.now();
    this.expiresAtByValue.forEach((expiresAt, value) => {
      if (expiresAt <= now) {
        this.expiresAtByValue.delete(value);
      }
    });
  }
}
