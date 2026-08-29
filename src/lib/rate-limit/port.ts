export interface RateLimitDecision {
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
}

export interface RateLimiterPort {
  consume(key: string, now?: number): RateLimitDecision;
}
