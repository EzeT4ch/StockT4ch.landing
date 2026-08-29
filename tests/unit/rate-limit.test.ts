import { describe, expect, it } from 'vitest';
import { MemoryRateLimiter } from '../../src/lib/rate-limit/memory-rate-limiter';

describe('MemoryRateLimiter', () => {
  it('limita dentro de la ventana y se recupera después', () => {
    const limiter = new MemoryRateLimiter(2, 1_000);
    expect(limiter.consume('ip', 0).allowed).toBe(true);
    expect(limiter.consume('ip', 10).allowed).toBe(true);
    expect(limiter.consume('ip', 20).allowed).toBe(false);
    expect(limiter.consume('ip', 1_001).allowed).toBe(true);
  });
});
