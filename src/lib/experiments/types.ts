export type HeroVariant = 'A' | 'B';

export interface ExperimentContext {
  readonly experimentId: 'hero_copy_v1';
  readonly variant: HeroVariant;
  readonly version: 1;
}
