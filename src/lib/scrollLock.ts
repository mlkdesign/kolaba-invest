/**
 * Background scroll lock for overlays (menu, image viewer). Works on iOS Safari, where
 * `overflow: hidden` on <body> alone does not stop scrolling: the body is pinned with
 * `position: fixed` and the scroll position is restored exactly on release.
 */
let depth = 0;
let savedY = 0;

export function lockScroll() {
  if (depth++ > 0) return;
  savedY = window.scrollY;
  const body = document.body.style;
  body.position = 'fixed';
  body.top = `-${savedY}px`;
  body.left = '0';
  body.right = '0';
  body.width = '100%';
  document.documentElement.classList.add('is-scroll-locked');
}

export function unlockScroll() {
  if (depth === 0 || --depth > 0) return;
  const body = document.body.style;
  body.position = '';
  body.top = '';
  body.left = '';
  body.right = '';
  body.width = '';
  document.documentElement.classList.remove('is-scroll-locked');
  window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
}
