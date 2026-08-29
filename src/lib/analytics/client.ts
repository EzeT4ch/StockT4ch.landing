import type { ExperimentContext } from '../experiments/types';

export type AnalyticsEventName =
  | 'EXPERIMENT_EXPOSURE'
  | 'CTA_CLICK'
  | 'FORM_START'
  | 'FORM_SUBMIT'
  | 'FORM_ERROR'
  | 'LAUNCH_SIGNUP'
  | 'TRIAL_START'
  | 'WHATSAPP_CLICK'
  | 'PLAN_CLICK'
  | 'FOUNDER_SIGNUP'
  | 'DEMO_VIDEO_PLAY'
  | 'PRICING_VIEW';

export interface AnalyticsPort {
  track(eventName: AnalyticsEventName, payload?: Record<string, unknown>): void;
}

interface AnalyticsEnvelope extends Record<string, unknown> {
  experiment: string;
  variant: ExperimentContext['variant'];
  page: string;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
    stockTechAnalytics?: AnalyticsPort;
  }
}

class ConsoleAnalyticsAdapter implements AnalyticsPort {
  public track(eventName: AnalyticsEventName, payload: Record<string, unknown> = {}): void {
    console.info('[analytics]', eventName, payload.experiment, payload.variant, payload);
  }
}

class GoogleAnalyticsAdapter implements AnalyticsPort {
  public track(eventName: AnalyticsEventName, payload: Record<string, unknown> = {}): void {
    window.dataLayer?.push({ event: eventName, ...payload });
  }
}

class MetaPixelAdapter implements AnalyticsPort {
  public track(eventName: AnalyticsEventName, payload: Record<string, unknown> = {}): void {
    window.fbq?.('trackCustom', eventName, payload);
  }
}

class CompositeAnalyticsAdapter implements AnalyticsPort {
  public constructor(private readonly adapters: readonly AnalyticsPort[]) {}
  public track(eventName: AnalyticsEventName, payload: Record<string, unknown> = {}): void {
    for (const adapter of this.adapters) adapter.track(eventName, payload);
  }
}

class ContextualAnalytics implements AnalyticsPort {
  public constructor(
    private readonly adapter: AnalyticsPort,
    private readonly context: ExperimentContext,
  ) {}
  public track(eventName: AnalyticsEventName, payload: Record<string, unknown> = {}): void {
    const envelope: AnalyticsEnvelope = {
      ...payload,
      experiment: this.context.experimentId,
      variant: this.context.variant,
      page: window.location.pathname,
    };
    this.adapter.track(eventName, envelope);
  }
}

const hasConsent = (): boolean => document.cookie.split(';').some((entry) => entry.trim() === 'st_analytics_consent=granted');

const loadGoogleAnalytics = (measurementId: string): void => {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtag.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);
  window.dataLayer.push({ event: 'config', measurement_id: measurementId, anonymize_ip: true });
};

const loadMetaPixel = (pixelId: string): void => {
  const queue: unknown[][] = [];
  window.fbq = (...args: unknown[]) => { queue.push(args); };
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.append(script);
  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
};

export const initializeAnalytics = (input: {
  context: ExperimentContext;
  enabled: boolean;
  debug: boolean;
  ga4MeasurementId: string | null;
  metaPixelId: string | null;
}): AnalyticsPort => {
  const adapters: AnalyticsPort[] = [];
  if (input.debug) adapters.push(new ConsoleAnalyticsAdapter());
  if (input.enabled && hasConsent()) {
    if (input.ga4MeasurementId) {
      loadGoogleAnalytics(input.ga4MeasurementId);
      adapters.push(new GoogleAnalyticsAdapter());
    }
    if (input.metaPixelId) {
      loadMetaPixel(input.metaPixelId);
      adapters.push(new MetaPixelAdapter());
    }
  }
  const analytics = new ContextualAnalytics(new CompositeAnalyticsAdapter(adapters), input.context);
  window.stockTechAnalytics = analytics;
  return analytics;
};
