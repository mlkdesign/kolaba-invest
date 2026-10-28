import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Same query as the inline script in index.html. */
export const DECK_QUERY = '(min-width: 1024px) and (min-height: 520px)';
export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
