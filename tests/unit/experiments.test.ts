import { describe, expect, it } from 'vitest';
import { assignHeroVariant, resolveHeroExperiment } from '../../src/lib/experiments/hero';

const balanced = { enabled: true, weightA: 50, weightB: 50 };

describe('hero_copy_v1', () => {
  it('asigna A o B según los pesos', () => {
    expect(assignHeroVariant(balanced, 0.49)).toBe('A');
    expect(assignHeroVariant(balanced, 0.50)).toBe('B');
  });
  it('mantiene A existente', () => expect(resolveHeroExperiment({ options: balanced, cookieValue: 'A', allowOverride: false }).context.variant).toBe('A'));
  it('mantiene B existente', () => expect(resolveHeroExperiment({ options: balanced, cookieValue: 'B', allowOverride: false }).context.variant).toBe('B'));
  it('establece cookie para un visitante nuevo', () => expect(resolveHeroExperiment({ options: balanced, allowOverride: false, randomValue: 0.2 }).shouldSetCookie).toBe(true));
  it('sirve A si está desactivado', () => expect(assignHeroVariant({ ...balanced, enabled: false }, 0.9)).toBe('A'));
  it('respeta pesos extremos', () => {
    expect(assignHeroVariant({ enabled: true, weightA: 100, weightB: 0 }, 0.999)).toBe('A');
    expect(assignHeroVariant({ enabled: true, weightA: 0, weightB: 100 }, 0)).toBe('B');
  });
  it('permite override sólo fuera de producción sin persistirlo', () => {
    const result = resolveHeroExperiment({ options: balanced, cookieValue: 'A', overrideValue: 'B', allowOverride: true });
    expect(result).toMatchObject({ context: { variant: 'B' }, shouldSetCookie: false, overridden: true });
  });
  it('rechaza pesos inválidos', () => expect(() => assignHeroVariant({ enabled: true, weightA: 60, weightB: 60 })).toThrow());
});
