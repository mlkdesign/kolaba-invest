import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type Anchor = { x: number; y: number } | (() => DOMRect | null);

type Props = {
  open: boolean;
  anchor: Anchor | null;
  /** Preferred side relative to the anchor. Flips when there is no room. */
  placement?: 'top' | 'bottom' | 'right' | 'left';
  offset?: number;
  id?: string;
  role?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

const MARGIN = 10;

/**
 * Viewport-anchored floating layer. Rendered in a portal (the deck track is transformed,
 * which would break position: fixed inside it) and clamped to the viewport edges.
 */
export function Popover({
  open,
  anchor,
  placement = 'top',
  offset = 14,
  id,
  role = 'tooltip',
  className = '',
  style,
  children,
  onPointerEnter,
  onPointerLeave,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [mounted, setMounted] = useState(open);

  useLayoutEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !anchor || !ref.current) return;
    const el = ref.current;
    const place = () => {
      const rect =
        typeof anchor === 'function' ? anchor() : new DOMRect(anchor.x, anchor.y, 0, 0);
      if (!rect) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left: number;
      let top: number;
      if (placement === 'right' || placement === 'left') {
        const right = rect.right + offset;
        const leftSide = rect.left - offset - w;
        left = placement === 'right' ? (right + w > vw - MARGIN ? leftSide : right) : leftSide < MARGIN ? right : leftSide;
        top = rect.top + rect.height / 2 - h / 2;
      } else {
        left = rect.left + rect.width / 2 - w / 2;
        const above = rect.top - offset - h;
        const below = rect.bottom + offset;
        const wantTop = placement === 'top';
        top = wantTop ? (above < MARGIN ? below : above) : below + h > vh - MARGIN ? above : below;
      }
      left = Math.min(Math.max(MARGIN, left), vw - w - MARGIN);
      top = Math.min(Math.max(MARGIN, top), vh - h - MARGIN);
      setPos({ left, top });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, mounted, anchor, placement, offset, children]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={ref}
      id={id}
      role={role}
      className={`popover ${open && pos ? 'is-open' : ''} ${className}`}
      style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999, ...style }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onTransitionEnd={() => !open && setMounted(false)}
      aria-hidden={!open}
    >
      {children}
    </div>,
    document.body,
  );
}
