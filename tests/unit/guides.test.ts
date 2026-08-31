import { describe, expect, it } from 'vitest';
import { getGuideBySlug, getRelatedGuides, guides } from '../../src/config/guides';

describe('guide catalog', () => {
  it('expone slugs únicos y metadata publicable', () => {
    const slugs = guides.map((guide) => guide.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const guide of guides) {
      expect(guide.title.length).toBeGreaterThan(20);
      expect(guide.description.length).toBeGreaterThan(70);
      expect(guide.sections.length).toBeGreaterThanOrEqual(3);
      expect(guide.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('resuelve sólo enlaces internos de guías existentes', () => {
    for (const guide of guides) {
      expect(getGuideBySlug(guide.slug)).toBe(guide);
      expect(getRelatedGuides(guide)).toHaveLength(guide.relatedSlugs.length);
    }
  });

  it('no expone una guía inexistente', () => expect(getGuideBySlug('no-existe')).toBeUndefined());
});
