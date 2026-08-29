const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const observeVisibility = (element: Element, callback: (visible: boolean) => void): IntersectionObserver | null => {
  if (!('IntersectionObserver' in window)) { callback(true); return null; }
  const observer = new IntersectionObserver(([entry]) => callback(Boolean(entry?.isIntersecting)), { threshold: 0.08 });
  observer.observe(element);
  return observer;
};

const setupCycler = (element: HTMLElement, maximum: number, intervalMs: number, render: (step: number) => void): void => {
  let step = 0;
  let timer: number | undefined;
  const stop = () => { if (timer !== undefined) window.clearInterval(timer); timer = undefined; };
  const start = () => {
    stop();
    if (reducedMotion.matches) { step = maximum; render(step); return; }
    timer = window.setInterval(() => { step = (step + 1) % (maximum + 1); render(step); }, intervalMs);
  };
  render(reducedMotion.matches ? maximum : step);
  observeVisibility(element, (visible) => visible ? start() : stop());
  reducedMotion.addEventListener('change', () => reducedMotion.matches ? (stop(), render(maximum)) : start());
};

const ticket = document.querySelector<HTMLElement>('[data-animated-ticket]');
if (ticket) setupCycler(ticket, 6, 1_500, (step) => {
  ticket.dataset.step = String(step);
  const empty = ticket.querySelector<HTMLElement>('[data-ticket-empty]');
  const total = ticket.querySelector<HTMLElement>('[data-ticket-total]');
  const payment = ticket.querySelector<HTMLElement>('[data-payment-status]');
  const status = ticket.querySelector<HTMLElement>('[data-ticket-status]');
  if (empty) empty.hidden = step >= 1;
  if (total) total.textContent = step >= 2 ? '$ 74.700' : step >= 1 ? '$ 42.900' : '$ 0';
  if (payment) payment.textContent = step >= 3 ? '✓ aprobado' : 'esperando';
  if (status) status.textContent = step >= 5 ? 'Venta registrada' : 'En curso';
});

const flowData = [
  ['Inventario', [['Auriculares Pulse Pro', '18 un.'], ['Teclado Nova TKL', '7 un.'], ['Mouse Orbit Wireless', '24 un.']], ['Productos con stock bajo', '12']],
  ['Venta en curso', [['Auriculares Pulse Pro ×1', '$ 42.900'], ['Mouse Orbit Wireless ×2', '$ 31.800']], ['Total', '$ 74.700']],
  ['Cobro', [['Mercado Pago', 'aprobado'], ['Comprobante interno', '#VT-2049']], ['Cobrado', '$ 74.700']],
  ['Caja turno tarde', [['Efectivo', '$ 128.400'], ['Mercado Pago', '$ 402.700'], ['QR', '$ 96.100']], ['Total del turno', '$ 627.200']],
  ['Comprobante', [['Factura B 0001-00000149', 'autorizada'], ['Stock', '−3 unidades']], ['Facturado', '$ 74.700']],
] as const;
const flow = document.querySelector<HTMLElement>('[data-product-flow]');
if (flow) {
  let locked = false;
  const render = (step: number) => {
    const index = Math.min(5, Math.max(1, step)) - 1;
    const panel = flowData[index];
    if (!panel) return;
    flow.dataset.step = String(index + 1);
    flow.querySelectorAll<HTMLButtonElement>('[data-flow-step]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.flowStep) === index + 1)));
    const title = flow.querySelector<HTMLElement>('[data-flow-title]');
    const count = flow.querySelector<HTMLElement>('[data-flow-count]');
    const rows = flow.querySelector<HTMLElement>('[data-flow-rows]');
    const footLabel = flow.querySelector<HTMLElement>('[data-flow-foot-label]');
    const footValue = flow.querySelector<HTMLElement>('[data-flow-foot-value]');
    if (title) title.textContent = panel[0];
    if (count) count.textContent = `0${index + 1} / 05`;
    if (rows) rows.innerHTML = panel[1].map(([label, value]) => `<div class="panel-row"><span>${label}</span><b>${value}</b></div>`).join('');
    if (footLabel) footLabel.textContent = panel[2][0];
    if (footValue) footValue.textContent = panel[2][1];
  };
  flow.querySelectorAll<HTMLButtonElement>('[data-flow-step]').forEach((button) => button.addEventListener('click', () => { locked = true; render(Number(button.dataset.flowStep)); }));
  let step = 1;
  let timer: number | undefined;
  const stop = () => { if (timer !== undefined) clearInterval(timer); timer = undefined; };
  observeVisibility(flow, (visible) => {
    stop();
    if (visible && !reducedMotion.matches && !locked) timer = window.setInterval(() => { step = step % 5 + 1; render(step); }, 2_800);
    if (reducedMotion.matches) render(5);
  });
}

const offline = document.querySelector<HTMLElement>('[data-offline-flow]');
if (offline) setupCycler(offline, 6, 1_700, (step) => {
  offline.dataset.step = String(step);
  const label = offline.querySelector<HTMLElement>('[data-connection-label]');
  if (label) label.textContent = step === 0 || step >= 5 ? 'En línea' : step === 4 ? 'Sincronizando' : 'Sin conexión';
  offline.querySelectorAll<HTMLElement>('[data-offline-row]').forEach((row) => {
    const index = Number(row.dataset.offlineRow);
    row.dataset.state = index < step ? 'done' : index === step ? 'active' : 'pending';
    const badge = row.firstElementChild;
    if (badge) badge.textContent = index < step ? '✓' : String(index + 1);
  });
});

const reveals = document.querySelectorAll<HTMLElement>('.reveal');
if (reducedMotion.matches || !('IntersectionObserver' in window)) reveals.forEach((element) => element.classList.add('visible'));
else {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
  reveals.forEach((element) => observer.observe(element));
}

const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const mobileMenu = document.querySelector<HTMLElement>('[data-mobile-menu]');
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  if (mobileMenu) mobileMenu.hidden = !open;
});
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { mobileMenu.hidden = true; menuToggle?.setAttribute('aria-expanded', 'false'); }));

document.querySelectorAll<HTMLElement>('[data-track]').forEach((element) => element.addEventListener('click', () => {
  const event = element.dataset.track;
  if (!event) return;
  const payload: Record<string, unknown> = {};
  if (element.dataset.placement) payload.placement = element.dataset.placement;
  if (element.dataset.plan) payload.plan = element.dataset.plan;
  window.stockTechAnalytics?.track(event as never, payload);
  if (event === 'FOUNDER_SIGNUP') window.stockTechAnalytics?.track('CTA_CLICK', { placement: element.dataset.placement });
}));

const pricing = document.querySelector('[data-pricing-section]');
if (pricing && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) { window.stockTechAnalytics?.track('PRICING_VIEW'); observer.disconnect(); }
  }, { threshold: 0.35 });
  observer.observe(pricing);
}
