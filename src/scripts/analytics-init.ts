import { initializeAnalytics } from '../lib/analytics/client';
import type { HeroVariant } from '../lib/experiments/types';

const context = document.querySelector<HTMLElement>('[data-page-context]');
if (context) {
  const tracker = initializeAnalytics({
    context: {
      experimentId: 'hero_copy_v1',
      variant: (context.dataset.variant === 'B' ? 'B' : 'A') as HeroVariant,
      version: 1,
    },
    enabled: context.dataset.analyticsEnabled === 'true',
    debug: context.dataset.analyticsDebug === 'true',
    ga4MeasurementId: context.dataset.ga4 || null,
    metaPixelId: context.dataset.meta || null,
  });
  tracker.track('EXPERIMENT_EXPOSURE');
}
