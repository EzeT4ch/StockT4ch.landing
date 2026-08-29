import { describe, expect, it } from 'vitest';
import { calculateFounderPrice, formatArs } from '../../src/config/commercial';

describe('pricing fundador', () => {
  it('calcula el descuento sin hardcodear derivados', () => expect(calculateFounderPrice(54_900, 20)).toBe(43_920));
  it('formatea importes en ARS', () => expect(formatArs(34_900)).toContain('34.900'));
});
