/**
 * Money — Value Object.
 *
 * Encapsulates a monetary amount and ensures it is always a valid number.
 * Follows DDD Value Object semantics: immutable, equality by value, no identity.
 *
 * Usage:
 *   const a = Money.of(100);
 *   const b = Money.of(50);
 *   a.add(b).toNumber()      // 150
 *   a.subtract(b).toNumber() // 50
 */
export class Money {
  private constructor(private readonly cents: number) {}

  static of(amount: number): Money {
    if (!Number.isFinite(amount)) {
      throw new Error(`Money.of: invalid amount "${amount}"`);
    }
    return new Money(amount);
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  isNegative(): boolean {
    return this.cents < 0;
  }

  toNumber(): number {
    return this.cents;
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  toString(): string {
    return this.cents.toString();
  }
}
