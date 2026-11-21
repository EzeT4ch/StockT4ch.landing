export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

const preLaunchQuestions = new Set(['¿Los precios publicados son definitivos?', '¿Qué es un Cliente Fundador?']);

export const createFaqs = (trialDays: number, founderSlots: number, founderDiscount: number, launched = false): readonly FaqItem[] => [
  { question: '¿Qué es StockTech?', answer: 'Un sistema de gestión para comercios: control de stock, ventas, pagos, caja y facturación con ARCA en un mismo flujo. Está pensado para comercios chicos, micro-PyMEs y PyMEs.' },
  { question: '¿Necesito instalar algo?', answer: 'No. Se usa desde el navegador, así que entrás desde la computadora del negocio sin instalar programas.' },
  { question: '¿Puedo usarlo desde el celular?', answer: 'Sí. Está diseñado para pantallas chicas, así que podés consultar y operar desde el celular.' },
  { question: '¿Qué pasa si se corta Internet?', answer: 'Podés seguir registrando ventas de contingencia, que quedan guardadas en el dispositivo y se sincronizan cuando vuelve la conexión. Lo que depende de servicios externos —la facturación con ARCA o el cobro con Mercado Pago— se completa al recuperar Internet.' },
  { question: '¿Cómo funciona la facturación con ARCA?', answer: 'La factura se emite desde la venta que registraste, con los datos del comercio que cargaste al configurar la cuenta. No tenés que volver a tipear nada.' },
  { question: '¿Qué medios de pago soporta?', answer: 'Al inicio: efectivo, Mercado Pago y QR. Vamos a sumar más medios de pago.' },
  { question: '¿Cuánto dura la prueba?', answer: launched ? `${trialDays} días, desde que creás tu cuenta.` : `${trialDays} días, desde que abrimos el acceso.` },
  { question: '¿Necesito tarjeta para probarlo?', answer: `No. La prueba de ${trialDays} días no pide tarjeta.` },
  { question: '¿Los precios publicados son definitivos?', answer: 'No. Son valores estimativos de pre-lanzamiento y pueden ajustarse antes de la salida. Si te sumaste a la lista, te avisamos si cambian.' },
  { question: '¿Qué es un Cliente Fundador?', answer: `Uno de los primeros ${founderSlots} comercios que entran con nosotros: acceso temprano, contacto directo para dar feedback y ${founderDiscount}% de descuento sobre el plan anual durante el primer año.` },
].filter((faq) => !launched || !preLaunchQuestions.has(faq.question));
