export interface GuideSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export interface GuideReference {
  readonly label: string;
  readonly url: string;
}

export interface Guide {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly intro: string;
  readonly updatedAt: string;
  readonly sections: readonly GuideSection[];
  readonly relatedSlugs: readonly string[];
  readonly references?: readonly GuideReference[];
}

const updatedAt = '2026-08-29';

export const guides: readonly Guide[] = [
  {
    slug: 'control-de-stock', title: 'Control de stock para comercios', updatedAt,
    description: 'Cómo ordenar productos, existencias y movimientos de stock en un comercio sin depender de una planilla aislada.',
    intro: 'El stock confiable no se consigue con un conteo anual: se construye cuando cada entrada, venta, ajuste y diferencia queda registrada en el momento.',
    sections: [
      { heading: 'Empezá por un inventario inicial revisado', paragraphs: ['Contá las existencias y cargá una cantidad inicial por producto. Revisá una muestra antes de darlo por terminado: una base equivocada hace que cualquier reporte posterior también lo sea.', 'Definí nombres claros, códigos reconocibles y una unidad de medida consistente. Eso evita duplicados y simplifica encontrar un producto desde el mostrador.'] },
      { heading: 'Registrá cada movimiento en su momento', paragraphs: ['Las ventas no son el único movimiento: una recepción, una merma o un ajuste de conteo también cambian la disponibilidad. Si se anotan después, se pierde el contexto de por qué cambió la cantidad.', 'Usá una referencia o motivo para los ajustes. Cuando aparece una diferencia, el historial permite revisarla sin corregir el número a ciegas.'] },
      { heading: 'Revisá faltantes antes de que frenen una venta', paragraphs: ['Definí una rutina corta para revisar productos de alta rotación y cantidades bajas. La frecuencia depende del movimiento del comercio, pero tiene que ocurrir antes de hacer un pedido urgente.', 'En un negocio con sucursales, mirá el stock por local. Mezclar disponibilidades de lugares distintos genera promesas de venta que después no se pueden cumplir.'] },
      { heading: 'Conectá stock y venta', paragraphs: ['El control se vuelve más confiable cuando la venta descuenta el producto desde el mismo flujo. Así no hace falta volver a cargar la salida en una planilla.', 'La información sirve para decidir mejor cuando refleja la operación diaria: qué se vendió, qué faltó y qué movimientos requieren una revisión.'] },
    ],
    relatedSlugs: ['inventario-inicial-negocio', 'punto-de-venta-para-comercios', 'sistema-gestion-pymes'],
  },
  {
    slug: 'facturacion-arca', title: 'Facturación con ARCA desde la venta', updatedAt,
    description: 'Qué revisar para integrar la facturación electrónica con la venta diaria de un comercio argentino.',
    intro: 'Facturar desde la venta evita duplicar productos e importes. También exige que la configuración fiscal y el circuito operativo estén preparados antes de atender al primer cliente.',
    sections: [
      { heading: 'Separá la configuración fiscal de la venta diaria', paragraphs: ['Antes de emitir comprobantes, el comercio debe completar los datos y habilitaciones que correspondan a su situación. Esa configuración se revisa con anticipación; no debería resolverse frente al cliente.', 'Las condiciones y servicios de ARCA pueden cambiar. Confirmá siempre el procedimiento vigente con un profesional contable o en los canales oficiales antes de operar.'] },
      { heading: 'Partí de una venta registrada', paragraphs: ['Cuando la factura usa la venta como origen, productos, cantidades, importes y medio de pago no se vuelven a tipear. Esto reduce diferencias entre lo cobrado, la caja y el comprobante.', 'Guardá el vínculo entre la venta y el comprobante autorizado. Es la trazabilidad que ayuda a revisar una operación completa ante una consulta posterior.'] },
      { heading: 'Definí qué sucede sin conexión', paragraphs: ['La autorización depende de servicios externos. Si no hay Internet, la operación comercial puede requerir un circuito de contingencia y la emisión queda pendiente hasta recuperar la conexión.', 'El equipo debe saber qué quedó pendiente y cómo verificar que se completó después. La contingencia no tiene que transformarse en una venta perdida ni en una factura duplicada.'] },
    ],
    relatedSlugs: ['punto-de-venta-para-comercios', 'cierre-de-caja-comercio', 'sistema-gestion-pymes'],
    references: [{ label: 'ARCA — Factura electrónica', url: 'https://www.arca.gob.ar/fe/' }],
  },
  {
    slug: 'como-controlar-stock-negocio', title: 'Cómo controlar el stock de un negocio', updatedAt,
    description: 'Pasos prácticos para mantener el inventario alineado con las ventas y la operación cotidiana.',
    intro: 'Controlar stock no significa sólo saber cuántas unidades hay: significa poder confiar en ese número para vender, reponer y decidir.',
    sections: [
      { heading: 'Elegí un único número de referencia', paragraphs: ['Si el equipo consulta una planilla, una libreta y un sistema, tarde o temprano aparecen números distintos. Definí dónde se registra el movimiento y usá ese lugar como fuente de consulta.', 'Priorizá productos, cantidades, movimientos y los datos necesarios para operar. Cargar información que nadie usa no mejora el control.'] },
      { heading: 'Contá con una frecuencia razonable', paragraphs: ['Los productos de mucha salida merecen una revisión más frecuente que los de rotación lenta. Lo importante es convertir el conteo en una rutina y dejar asentadas las diferencias.', 'Cuando el conteo no coincide, investigá la causa antes de ajustar. Una merma, una recepción incompleta o una venta no registrada requieren respuestas distintas.'] },
      { heading: 'No mezcles sucursales ni depósitos', paragraphs: ['Cada local necesita saber qué tiene disponible en ese lugar. Separar ubicaciones desde el inicio evita trasladar mentalmente el stock y reduce errores al responder a un cliente.', 'Los traslados también son movimientos. Registrarlos deja claro qué salió de un lugar, qué llegó al otro y qué está pendiente de recibir.'] },
    ],
    relatedSlugs: ['control-de-stock', 'inventario-inicial-negocio', 'cierre-de-caja-comercio'],
  },
  {
    slug: 'sistema-gestion-pymes', title: 'Sistema de gestión para comercios y PyMEs', updatedAt,
    description: 'Qué evaluar en un sistema que reúna stock, ventas, pagos, caja y facturación para un comercio argentino.',
    intro: 'Elegir una herramienta de gestión no es sumar pantallas: es definir cómo se conectan las tareas que el comercio ya hace todos los días.',
    sections: [
      { heading: 'Empezá por el flujo del mostrador', paragraphs: ['Recorré una venta real: buscar un producto, cobrar, registrar el medio de pago, actualizar la caja y emitir el comprobante si corresponde. Si una tarea se repite en dos herramientas, hay una oportunidad de simplificar.', 'Probá el sistema con quienes van a usarlo. Una función útil que nadie puede operar con tranquilidad no resuelve la tarea diaria.'] },
      { heading: 'Pedí trazabilidad, no sólo reportes', paragraphs: ['Los reportes sirven cuando se puede llegar desde un total hasta la operación que lo compone. Eso permite revisar una diferencia de caja, una venta o un ajuste de stock sin reconstruir el día entero.', 'Consultá cómo se registran anulaciones, correcciones y movimientos entre sucursales. Son situaciones normales de una operación real.'] },
      { heading: 'Planificá la puesta en marcha', paragraphs: ['Antes de empezar, prepará el catálogo, precios, stock inicial, sucursales y usuarios. Tener estos datos revisados hace que el primer día sea más previsible.', 'Definí una persona responsable de validar la primera semana de operación y de reunir las dudas del equipo.'] },
    ],
    relatedSlugs: ['punto-de-venta-para-comercios', 'control-de-stock', 'facturacion-arca'],
  },
  {
    slug: 'punto-de-venta-para-comercios', title: 'Punto de venta para comercios: qué debe resolver', updatedAt,
    description: 'Qué mirar en un punto de venta para registrar ventas, cobros, stock y caja sin sumar tareas manuales.',
    intro: 'Un punto de venta útil acompaña el ritmo del mostrador y deja una operación entendible para quien vende y para quien revisa el negocio al final del día.',
    sections: [
      { heading: 'La venta tiene que ser simple de registrar', paragraphs: ['Buscar el producto, confirmar la cantidad y cerrar la operación debe seguir un recorrido claro. La velocidad importa, pero no a costa de perder información que después necesita la caja o el stock.', 'Probalo con el catálogo y los medios de pago reales del comercio. Los ejemplos genéricos no muestran los problemas de una operación cotidiana.'] },
      { heading: 'El cobro debe quedar vinculado a la venta', paragraphs: ['Registrar cómo se pagó permite que el cierre refleje efectivo, billeteras o QR sin tener que volver a clasificar cada movimiento.', 'Cuando hay una diferencia, el equipo necesita poder encontrar la venta y revisar lo que se registró, en lugar de buscar en varias aplicaciones.'] },
      { heading: 'Prepará un circuito de contingencia', paragraphs: ['Preguntá qué puede seguir haciendo el equipo si falla la conexión y qué tareas quedan pendientes. El objetivo es conservar el registro de la venta y completar lo que dependa de servicios externos después.', 'El circuito debe ser comprensible para el personal: una contingencia útil es la que se puede ejecutar sin improvisar.'] },
    ],
    relatedSlugs: ['cierre-de-caja-comercio', 'control-de-stock', 'facturacion-arca'],
  },
  {
    slug: 'cierre-de-caja-comercio', title: 'Cómo hacer el cierre de caja de un comercio', updatedAt,
    description: 'Una rutina de cierre de caja para comparar ventas, medios de pago y efectivo de forma ordenada.',
    intro: 'El cierre de caja sirve para revisar el día mientras los detalles todavía son fáciles de recordar. No es una tarea administrativa aislada: es parte del control de la operación.',
    sections: [
      { heading: 'Definí el período y la persona responsable', paragraphs: ['Acordá cuándo termina cada turno y quién realiza o valida el cierre. Si el equipo no comparte ese criterio, una venta puede quedar en el día o turno equivocado.', 'Dejá explícito el fondo inicial y cualquier ingreso o retiro que no sea una venta. Eso evita comparaciones incompletas.'] },
      { heading: 'Compará por medio de pago', paragraphs: ['Revisá efectivo, billeteras, QR u otros cobros por separado. Cada medio tiene su propio comprobante o disponibilidad y mezclar todo oculta diferencias.', 'Usá la misma clasificación con la que se registró la venta. Reclasificar al cierre agrega pasos y puede cambiar el número que se quiere controlar.'] },
      { heading: 'Investigá diferencias con la operación a la vista', paragraphs: ['Ante una diferencia, buscá primero ventas, anulaciones, devoluciones, retiros o errores de carga del turno. Un sistema con trazabilidad permite llegar a la operación sin revisar todo desde cero.', 'Registrá el motivo de cualquier ajuste. Corregir un total sin explicación dificulta entender qué pasó si la diferencia vuelve a aparecer.'] },
    ],
    relatedSlugs: ['punto-de-venta-para-comercios', 'facturacion-arca', 'control-de-stock'],
  },
  {
    slug: 'inventario-inicial-negocio', title: 'Cómo cargar el inventario inicial de un negocio', updatedAt,
    description: 'Una guía para preparar productos, cantidades y verificaciones antes de empezar a controlar stock en un sistema.',
    intro: 'El inventario inicial es el punto de partida del control de stock. Prepararlo con criterio evita que el equipo empiece a trabajar con cantidades que nadie confía.',
    sections: [
      { heading: 'Ordená el catálogo antes de contar', paragraphs: ['Reuní nombres de productos, presentaciones, precios y códigos que ya use el comercio. Resolver duplicados antes del conteo evita cargar la misma mercadería bajo dos nombres.', 'Definí una unidad clara para cada producto. Si se vende por unidad, peso o paquete, la forma de registrar debe coincidir con la operación real.'] },
      { heading: 'Contá por ubicación', paragraphs: ['Separá el conteo por local, depósito o sector si el negocio tiene más de una ubicación. Así la disponibilidad inicial refleja dónde está realmente la mercadería.', 'Trabajá con una lista que permita marcar lo revisado. Cuando el catálogo es grande, dividir la tarea por sectores disminuye omisiones.'] },
      { heading: 'Validá antes de habilitar la venta', paragraphs: ['Revisá una muestra de productos de distinta rotación y precio antes de usar el número para operar. Si aparece un error de método, es más fácil corregirlo antes de iniciar las ventas.', 'Conservá la fecha del conteo y quién lo validó. Es el contexto necesario para entender la primera diferencia que aparezca.'] },
    ],
    relatedSlugs: ['control-de-stock', 'como-controlar-stock-negocio', 'sistema-gestion-pymes'],
  },
];

export const getGuideBySlug = (slug: string): Guide | undefined => guides.find((guide) => guide.slug === slug);

export const getRelatedGuides = (guide: Guide): readonly Guide[] => guide.relatedSlugs
  .map(getGuideBySlug)
  .filter((related): related is Guide => related !== undefined);
