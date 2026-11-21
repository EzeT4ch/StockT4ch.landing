import { describe, expect, it } from 'vitest';
import { createFaqs } from '../../src/config/content';

describe('FAQ según el modo', () => {
  it('prelaunch conserva las preguntas del programa fundador', () => {
    const questions = createFaqs(15, 10, 20).map((faq) => faq.question);
    expect(questions).toContain('¿Qué es un Cliente Fundador?');
    expect(questions).toContain('¿Los precios publicados son definitivos?');
  });
  it('launched no menciona pre-lanzamiento ni Clientes Fundadores', () => {
    const text = createFaqs(15, 10, 20, true).map((faq) => `${faq.question} ${faq.answer}`).join('\n');
    expect(text).not.toMatch(/fundador|lanzamiento|estimativ|abrimos el acceso/i);
  });
});
