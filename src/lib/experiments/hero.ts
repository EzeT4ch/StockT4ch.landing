import type { ExperimentContext, HeroVariant } from './types';

export const HERO_EXPERIMENT_ID = 'hero_copy_v1' as const;
export const HERO_EXPERIMENT_COOKIE = 'st_exp_hero_v1';

export interface HeroExperimentOptions {
  readonly enabled: boolean;
  readonly weightA: number;
  readonly weightB: number;
}

export const isHeroVariant = (value: string | undefined): value is HeroVariant => value === 'A' || value === 'B';

export const assignHeroVariant = (options: HeroExperimentOptions, randomValue = Math.random()): HeroVariant => {
  if (!options.enabled) return 'A';
  if (options.weightA < 0 || options.weightB < 0 || options.weightA + options.weightB !== 100) {
    throw new Error('Los pesos del experimento deben ser positivos y sumar 100.');
  }
  return randomValue * 100 < options.weightA ? 'A' : 'B';
};

export const resolveHeroExperiment = (input: {
  readonly options: HeroExperimentOptions;
  readonly cookieValue?: string;
  readonly overrideValue?: string;
  readonly allowOverride: boolean;
  readonly randomValue?: number;
}): { context: ExperimentContext; shouldSetCookie: boolean; overridden: boolean } => {
  if (!input.options.enabled) {
    return { context: { experimentId: HERO_EXPERIMENT_ID, variant: 'A', version: 1 }, shouldSetCookie: false, overridden: false };
  }
  if (input.allowOverride && isHeroVariant(input.overrideValue)) {
    return { context: { experimentId: HERO_EXPERIMENT_ID, variant: input.overrideValue, version: 1 }, shouldSetCookie: false, overridden: true };
  }
  if (isHeroVariant(input.cookieValue)) {
    return { context: { experimentId: HERO_EXPERIMENT_ID, variant: input.cookieValue, version: 1 }, shouldSetCookie: false, overridden: false };
  }
  const variant = assignHeroVariant(input.options, input.randomValue);
  return { context: { experimentId: HERO_EXPERIMENT_ID, variant, version: 1 }, shouldSetCookie: true, overridden: false };
};
