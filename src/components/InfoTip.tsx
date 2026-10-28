import { useEffect, useId, useRef, useState } from 'react';
import { Popover } from './Popover';

type Props = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * "ⓘ" help button. Opens on hover, keyboard focus and click/tap (click pins it).
 * Escape or an outside click closes it — never hover-only.
 */
export function InfoTip({ label, children, className = '' }: Props) {
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [pinned, setPinned] = useState(false);
  const closeTimer = useRef<number>();
  const open = hover || focus || pinned;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPinned(false);
        setHover(false);
        setFocus(false);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!btn.current?.contains(e.target as Node)) {
        setPinned(false);
        setHover(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const enter = () => {
    window.clearTimeout(closeTimer.current);
    setHover(true);
  };
  const leave = () => {
    closeTimer.current = window.setTimeout(() => setHover(false), 120);
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        className={`infotip ${className}`}
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onPointerEnter={(e) => e.pointerType === 'mouse' && enter()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && leave()}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false);
          setPinned(false);
        }}
        onClick={() => setPinned((p) => !p)}
      >
        ⓘ
      </button>
      <Popover
        open={open}
        anchor={() => btn.current?.getBoundingClientRect() ?? null}
        id={id}
        className="popover--info"
        onPointerEnter={enter}
        onPointerLeave={leave}
      >
        {children}
      </Popover>
    </>
  );
}
