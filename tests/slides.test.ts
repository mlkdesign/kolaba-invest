import { describe, expect, it } from 'vitest';
import { LEGACY_ANCHORS, NAV_TARGETS, SLIDES, SLIDE_COUNT, slideIndexForHash } from '../src/data/slides';
import { en } from '../src/content/en';
import { ru } from '../src/content/ru';
import { pageFor } from '../src/pages/routes';

describe('investor proposal structure', () => {
  it('has seven sections, each reachable from a hash', () => {
    expect(SLIDE_COUNT).toBe(7);
    SLIDES.forEach((s, i) => expect(slideIndexForHash(`#${s.id}`)).toBe(i));
  });

  it('keeps links to the former 12-slide deck working', () => {
    for (const [old, target] of Object.entries(LEGACY_ANCHORS)) {
      expect(slideIndexForHash(`#${old}`), old).toBe(SLIDES.findIndex((s) => s.id === target));
    }
    expect(slideIndexForHash('#nope')).toBe(-1);
  });

  it('every navigation target and title exists in both locales', () => {
    for (const { group, slide } of NAV_TARGETS) {
      expect(SLIDES.some((s) => s.id === slide)).toBe(true);
      expect(en.header.nav[group]).toBeTruthy();
      expect(ru.header.nav[group]).toBeTruthy();
    }
    for (const s of SLIDES) {
      expect(en.sectionNames[s.id]).toBeTruthy();
      expect(ru.sectionNames[s.id]).toBeTruthy();
    }
  });

  it('serves the proposal at the root and at /investors', () => {
    expect(pageFor('/')).toBe('investors');
    expect(pageFor('/investors')).toBe('investors');
    expect(pageFor('/investors/')).toBe('investors');
    expect(pageFor('/something-else')).toBeNull();
  });
});
