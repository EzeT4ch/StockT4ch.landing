export type SiteMode = 'prelaunch' | 'launched';

export interface CommercialPlan {
  readonly id: 'comercio' | 'negocio' | 'empresa';
  readonly name: string;
  readonly price: number;
  readonly who: string;
  readonly features: readonly string[];
  readonly recommended?: boolean;
}

export interface CommercialConfig {
  readonly brand: { readonly product: string; readonly company: string };
  readonly mode: SiteMode;
  readonly trialDays: number;
  readonly founders: {
    readonly slots: number;
    readonly discount: number;
    readonly scope: string;
  };
  readonly plans: readonly CommercialPlan[];
}

export const createCommercialConfig = (values: {
  mode: SiteMode;
  trialDays: number;
  founderSlots: number;
  founderDiscount: number;
}): CommercialConfig => ({
  brand: { product: 'StockTech', company: 'EzeTech' },
  mode: values.mode,
  trialDays: values.trialDays,
  founders: {
    slots: values.founderSlots,
    discount: values.founderDiscount,
    scope: 'plan anual durante el primer año',
  },
  plans: [
    {
      id: 'comercio',
      name: 'Comercio',
      price: 34_900,
      who: 'Para negocios que quieren ordenar su operación diaria.',
      features: ['Stock y productos', 'Ventas desde el mostrador', 'Caja diaria', 'Facturación con ARCA', 'Efectivo, Mercado Pago y QR', 'Ventas de contingencia'],
    },
    {
      id: 'negocio',
      name: 'Negocio',
      price: 54_900,
      recommended: true,
      who: 'Para comercios con más movimiento y necesidades de control.',
      features: ['Todo lo del plan Comercio', 'Varias sucursales', 'Reportes de ventas', 'Control de caja por turno', 'Ajustes de inventario'],
    },
    {
      id: 'empresa',
      name: 'Empresa',
      price: 89_900,
      who: 'Para operaciones de mayor complejidad o varias sucursales.',
      features: ['Todo lo del plan Negocio', 'Usuarios y permisos por rol', 'Auditoría de operaciones', 'Soporte prioritario', 'Acompañamiento en la carga inicial'],
    },
  ],
});

const arsFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
});

export const formatArs = (value: number): string => arsFormatter.format(value).replace('$', '$ ');

export const calculateFounderPrice = (price: number, discount: number): number =>
  Math.round(price * (1 - discount / 100));
