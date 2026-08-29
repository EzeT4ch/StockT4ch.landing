/// <reference types="astro/client" />

import type { ExperimentContext } from './lib/experiments/types';

declare global {
  namespace App {
    interface Locals {
      experiment: ExperimentContext | null;
      requestId: string;
    }
  }
}

export {};
