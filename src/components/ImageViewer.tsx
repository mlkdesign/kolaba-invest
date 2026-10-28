import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { lockScroll, unlockScroll } from '../lib/scrollLock';

export type ViewerImage = { src: string; alt: string; caption?: string };

type Props = {
  images: ViewerImage[];
  /** Index to show, or null when closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  labels: { close: string; zoomIn: string; zoomOut: string; prev: string; next: string; dialog: string };
};

const MAX_SCALE = 5;

/**
 * Fullscreen image viewer for research screenshots: pinch / wheel / double-tap zoom,
 * drag to pan, Escape or the close button to exit. The page behind is scroll-locked
 * and the reader returns to the same position.
 */
export function ImageViewer({ images, index, onIndexChange, labels }: Props) {
  const open = index !== null;
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const view = useRef({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; scale: number; mid: { x: number; y: number }; x: number; y: number } | null>(null);
  const lastTap = useRef(0);
  const [zoomed, setZoomed] = useState(false);

  const apply = useCallback(() => {
    const el = img.current;
    const box = stage.current;
    if (!el || !box) return;
    const v = view.current;
    // Keep the image covering the viewport edges while zoomed (no panning into empty space).
    const maxX = Math.max(0, (el.offsetWidth * v.scale - box.clientWidth) / 2);
    const maxY = Math.max(0, (el.offsetHeight * v.scale - box.clientHeight) / 2);
    v.x = Math.max(-maxX, Math.min(maxX, v.x));
    v.y = Math.max(-maxY, Math.min(maxY, v.y));
    el.style.transform = `translate3d(${v.x}px, ${v.y}px, 0) scale(${v.scale})`;
    setZoomed(v.scale > 1.01);
  }, []);

  /** Zoom to `scale`, keeping the point (cx, cy) in viewport coordinates under the finger. */
  const zoomTo = useCallback(
    (scale: number, cx?: number, cy?: number) => {
      const box = stage.current?.getBoundingClientRect();
      const v = view.current;
      const next = Math.max(1, Math.min(MAX_SCALE, scale));
      if (box && cx !== undefined && cy !== undefined) {
        const ox = cx - (box.left + box.width / 2);
        const oy = cy - (box.top + box.height / 2);
        v.x = ox - ((ox - v.x) * next) / v.scale;
        v.y = oy - ((oy - v.y) * next) / v.scale;
      }
      v.scale = next;
      if (next === 1) {
        v.x = 0;
        v.y = 0;
      }
      apply();
    },
    [apply],
  );

  const reset = useCallback(() => {
    view.current = { scale: 1, x: 0, y: 0 };
    apply();
  }, [apply]);

  const close = useCallback(() => onIndexChange(null), [onIndexChange]);

  useLayoutEffect(() => {
    if (open) reset();
  }, [open, index, reset]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    lockScroll();
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === '+' || e.key === '=') zoomTo(view.current.scale * 1.5);
      else if (e.key === '-') zoomTo(view.current.scale / 1.5);
      else if (e.key === 'ArrowRight' && images.length > 1) onIndexChange(((index ?? 0) + 1) % images.length);
      else if (e.key === 'ArrowLeft' && images.length > 1) onIndexChange(((index ?? 0) - 1 + images.length) % images.length);
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      unlockScroll();
      previous?.focus({ preventScroll: true });
    };
  }, [open, index, images.length, close, zoomTo, onIndexChange]);

  if (!open) return null;
  const image = images[index];

  const onPointerDown = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // pointer already released
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        scale: view.current.scale,
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        x: view.current.x,
        y: view.current.y,
      };
    }
    if (e.pointerType !== 'mouse' && pointers.current.size === 1) {
      const now = performance.now();
      if (now - lastTap.current < 280) zoomTo(view.current.scale > 1.01 ? 1 : 2.5, e.clientX, e.clientY);
      lastTap.current = now;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()];
      const g = gesture.current;
      const ratio = Math.hypot(a.x - b.x, a.y - b.y) / g.dist;
      view.current = { scale: g.scale, x: g.x, y: g.y };
      zoomTo(g.scale * ratio, g.mid.x, g.mid.y);
      return;
    }
    if (view.current.scale > 1.01) {
      view.current.x += e.clientX - prev.x;
      view.current.y += e.clientY - prev.y;
      apply();
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
  };

  return createPortal(
    <div className="viewer" role="dialog" aria-modal="true" aria-label={labels.dialog} data-native-scroll="">
      <div
        ref={stage}
        className={`viewer__stage ${zoomed ? 'is-zoomed' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => zoomTo(view.current.scale > 1.01 ? 1 : 2.5, e.clientX, e.clientY)}
        onWheel={(e) => zoomTo(view.current.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY)}
      >
        <img ref={img} className="viewer__img" src={image.src} alt={image.alt} draggable={false} onLoad={reset} />
      </div>
      <div className="viewer__bar">
        {images.length > 1 && (
          <>
            <button type="button" className="viewer__btn" aria-label={labels.prev} onClick={() => onIndexChange((index - 1 + images.length) % images.length)}>
              ‹
            </button>
            <span className="viewer__count">
              {index + 1} / {images.length}
            </span>
            <button type="button" className="viewer__btn" aria-label={labels.next} onClick={() => onIndexChange((index + 1) % images.length)}>
              ›
            </button>
          </>
        )}
        <button type="button" className="viewer__btn" aria-label={labels.zoomOut} onClick={() => zoomTo(view.current.scale / 1.5)}>
          −
        </button>
        <button type="button" className="viewer__btn" aria-label={labels.zoomIn} onClick={() => zoomTo(view.current.scale * 1.5)}>
          +
        </button>
        <button ref={closeBtn} type="button" className="viewer__btn viewer__btn--close" aria-label={labels.close} onClick={close}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {image.caption && <p className="viewer__caption">{image.caption}</p>}
    </div>,
    document.body,
  );
}
