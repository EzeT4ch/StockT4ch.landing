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
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    stockTechAnalytics?: AnalyticsPort;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export const ANALYTICS_CONSENT_CHANGE_EVENT = 'stocktech:analytics-consent-change';

const ga4EventNames: Readonly<Record<AnalyticsEventName, string>> = {
  EXPERIMENT_EXPOSURE: 'experiment_exposure',
  CTA_CLICK: 'cta_click',
  FORM_START: 'form_start',
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',
  LAUNCH_SIGNUP: 'generate_lead',
  TRIAL_START: 'start_trial',
  WHATSAPP_CLICK: 'whatsapp_click',
  PLAN_CLICK: 'plan_click',
  FOUNDER_SIGNUP: 'founder_signup',
  DEMO_VIDEO_PLAY: 'demo_video_play',
  PRICING_VIEW: 'pricing_view',
};

export const toGa4EventName = (eventName: AnalyticsEventName): string => ga4EventNames[eventName];

export const toGa4Parameters = (payload: Record<string, unknown>): Record<string, string> => {
  const parameters: Record<string, string> = {};
  const add = (parameter: string, value: unknown): void => {
    if (typeof value === 'string' && value.length > 0) parameters[parameter] = value.slice(0, 100);
  };
  add('experiment_id', payload.experiment);
  add('experiment_variant', payload.variant);
  add('page_path', payload.page);
  add('cta_placement', payload.placement);
  add('pricing_plan', payload.plan);
  add('form_name', payload.form);
  add('branch_range', payload.sucursales);
  add('error_reason', payload.reason);
  if (Array.isArray(payload.fields) && payload.fields.every((field) => typeof field === 'string')) add('invalid_fields', payload.fields.join(','));
  return parameters;
};

class ConsoleAnalyticsAdapter implements AnalyticsPort {
  public track(eventName: AnalyticsEventName, payload: Record<string, unknown> = {}): void {
    console.info('[analytics]', eventName, payload.experiment, payload.variant, payload);
  }
}

class GoogleAnalyticsAdapter implements AnalyticsPort {
  public track(eventName: AnalyticsEventName, payload: Record<string, unknown> = {}): void {
    window.gtag?.('event', toGa4EventName(eventName), toGa4Parameters(payload));
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
  window[`ga-disable-${measurementId}`] = false;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(): void { window.dataLayer?.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('consent', 'default', { analytics_storage: 'granted' });
  window.gtag('config', measurementId, { anonymize_ip: true });
  if (!document.querySelector(`script[data-ga4-measurement-id="${measurementId}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.ga4MeasurementId = measurementId;
    document.head.append(script);
  }
};

const disableGoogleAnalytics = (measurementId: string): void => {
  window[`ga-disable-${measurementId}`] = true;
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
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
  let providersActive = false;
  const createTracker = (): AnalyticsPort => {
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
      providersActive = adapters.some((adapter) => !(adapter instanceof ConsoleAnalyticsAdapter));
    }
    return new ContextualAnalytics(new CompositeAnalyticsAdapter(adapters), input.context);
  };

  const setTracker = (): AnalyticsPort => {
    const analytics = createTracker();
    window.stockTechAnalytics = analytics;
    return analytics;
  };

  const initialTracker = setTracker();
  window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, ((event: CustomEvent<{ decision?: string }>) => {
    if (event.detail.decision === 'granted' && !providersActive) setTracker().track('EXPERIMENT_EXPOSURE');
    if (event.detail.decision === 'denied') {
      if (input.ga4MeasurementId) disableGoogleAnalytics(input.ga4MeasurementId);
      providersActive = false;
      window.stockTechAnalytics = new ContextualAnalytics(new CompositeAnalyticsAdapter(input.debug ? [new ConsoleAnalyticsAdapter()] : []), input.context);
    }
  }) as EventListener);
  return initialTracker;
};
