import { useCallback, useEffect, useRef, useState } from 'react';
import { Slide } from '../components/Slide';
import { SlideEyebrow } from '../components/SlideEyebrow';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { DonutChart, SEGMENT_ANGLES } from '../components/DonutChart';
import { Popover, type Anchor } from '../components/Popover';
import { Button } from '../components/Button';
import { useContent } from '../content';
import { useSection } from '../engine/SectionContext';
import {
  CONTINGENCY_RESERVE,
  INVESTMENT_CATEGORIES,
  OPERATING_BUDGET,
  PLAN_DURATIONS,
  ROADMAP_PHASES,
  TOTAL_ROUND,
  shareOf,
  type InvestmentCategory,
} from '../data/budget';
import { formatNumber, usd } from '../lib/format';
import { isFlowLayout, reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import { useEngine } from '../engine/SlideEngine';
import './RoadmapInvestment.css';

type SegmentId = InvestmentCategory['id'];
const pad = (n: number) => String(n).padStart(2, '0');

function Content() {
  const c = useContent().roadmap;
  const donutRef = useRef<HTMLDivElement>(null);
  const phaseRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [segment, setSegment] = useState<SegmentId | null>(null);
  const [pinnedSegment, setPinnedSegment] = useState(false);
  const [phase, setPhase] = useState<number | null>(null);
  const leaveTimer = useRef<number>();
  const { active: sectionActive } = useSection();
  const { mode } = useEngine();
  const flow = mode === 'flow';
  const timelineRef = useRef<HTMLOListElement>(null);
  const [reached, setReached] = useState(0);

  // Mobile: the timeline line fills with scrolling and phases light up as they are reached.
  useEffect(() => {
    if (!flow) return;
    const list = timelineRef.current;
    const line = list?.querySelector<HTMLElement>('.timeline__line');
    if (!list || !line) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = list.getBoundingClientRect();
      const mark = window.innerHeight * 0.65;
      const p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
      line.style.setProperty('--fill', String(p));
      const count = [...list.querySelectorAll<HTMLElement>('.phase')].filter((el) => el.getBoundingClientRect().top + 20 < mark).length;
      setReached(count);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [flow]);
  useEffect(() => {
    if (sectionActive) return;
    setSegment(null);
    setPinnedSegment(false);
    setPhase(null);
  }, [sectionActive]);

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.roadmap__intro > *'), 0);
    reveal(tl, q('.duration'), 0.2, { stagger: 0.1 });
    if (!isFlowLayout()) tl.from(q('.timeline__line'), { scaleY: 0, duration: 1.3, ease: 'power2.inOut' }, 0.35);
    q('.phase').forEach((row, i) => {
      const t = 0.45 + i * 0.28;
      tl.from(row.querySelector('.phase__node'), { scale: 0, duration: 0.45, ease: 'back.out(2.2)' }, t);
      tl.from(row.querySelectorAll('.phase__id, .phase__text'), { autoAlpha: 0, x: -14, duration: 0.95, stagger: 0.08 }, t + 0.05);
    });
    tl.from(q('.donut'), { autoAlpha: 0, scale: 0.96, duration: 0.8 }, 0.2);
    reveal(tl, q('.legend__row'), 1.05, { stagger: 0.09, y: 12 });
    reveal(tl, q('.roadmap__recon, .roadmap__statement, .roadmap__team'), 1.35);
  });

  // Popup anchor: a point just outside the ring at the segment's mid-angle.
  const segmentAnchor = useCallback((id: SegmentId): Anchor => {
    return () => {
      const r = donutRef.current?.getBoundingClientRect();
      if (!r) return null;
      const a = SEGMENT_ANGLES[id];
      const radius = r.width / 2 + 6;
      const x = r.left + r.width / 2 + Math.sin(a) * radius;
      const y = r.top + r.height / 2 - Math.cos(a) * radius;
      return new DOMRect(x, y, 0, 0);
    };
  }, []);

  const hoverSegment = (id: SegmentId | null, source: 'pointer' | 'tap' | 'focus') => {
    window.clearTimeout(leaveTimer.current);
    if (source === 'tap') {
      if (pinnedSegment && segment === id) {
        setSegment(null);
        setPinnedSegment(false);
      } else {
        setSegment(id);
        setPinnedSegment(true);
      }
      return;
    }
    if (pinnedSegment && source === 'pointer') return;
    if (id) setSegment(id);
    // Small grace period: crossing the gap between two segments never flickers the popup.
    else leaveTimer.current = window.setTimeout(() => setSegment(null), 90);
  };

  // Escape / outside click closes pinned popups and the phase detail.
  useEffect(() => {
    if (!pinnedSegment && phase === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setPinnedSegment(false);
      setSegment(null);
      if (phase !== null) {
        phaseRefs.current[phase]?.focus();
        setPhase(null);
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      if (t.closest('.donut, .donut-detail, .legend, .phase-detail, .phase-inline, .phase')) return;
      setPinnedSegment(false);
      setSegment(null);
      setPhase(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [pinnedSegment, phase]);

  const activeCat = segment ? INVESTMENT_CATEGORIES.find((x) => x.id === segment) : undefined;
  const activePhase = phase !== null ? ROADMAP_PHASES[phase] : undefined;

  return (
    <>
      <div className="slide__rule" />
      <div className="roadmap">
        <div className="roadmap__left">
          <header className="intro roadmap__intro">
            <SlideEyebrow />
            <h2 className="display">
              {c.title.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h2>
          </header>

          <ul className="roadmap__durations">
            {PLAN_DURATIONS.map((d) => (
              <li className="duration" key={d.id}>
                <span className="duration__value">
                  <AnimatedCounter value={d.months} delay={0.3} duration={0.9} />
                </span>
                <span className="duration__label">{c.durations[d.id]}</span>
              </li>
            ))}
          </ul>

          <ol className="timeline" ref={timelineRef}>
            <span className="timeline__line" aria-hidden="true" />
            {ROADMAP_PHASES.map((p, i) => {
              const copy = c.phases[p.id as keyof typeof c.phases];
              const open = phase === i;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    ref={(el) => (phaseRefs.current[i] = el)}
                    className={`phase ${open ? 'is-open' : ''} ${flow && i < reached ? 'is-reached' : ''}`}
                    aria-expanded={open}
                    aria-controls={open ? 'phase-detail' : undefined}
                    aria-label={`${pad(i + 1)} / ${copy.name}, ${p.months}, ${usd(p.budget)} — ${c.phaseDetails}`}
                    onClick={() => setPhase(open ? null : i)}
                  >
                    <span className="phase__marker" aria-hidden="true">
                      <span className="phase__node" />
                    </span>
                    <span className="phase__id">
                      <span className="phase__name">
                        {pad(i + 1)} / {copy.name}
                      </span>
                      <span className="phase__meta">
                        {p.months}　<AnimatedCounter value={p.budget} prefix="$" delay={0.55 + i * 0.28} duration={0.9} />
                      </span>
                    </span>
                    <span className="phase__text">{copy.text}</span>
                    {flow && (
                      <span className="phase__toggle" aria-hidden="true">
                        +
                      </span>
                    )}
                  </button>
                  {flow && open && (
                    <div className="phase-inline" id="phase-detail">
                      <p className="phase-inline__headline">{copy.headline}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <p className="roadmap__team">{c.team}</p>
        </div>

        <div className="roadmap__right">
          <DonutChart
            rootRef={donutRef}
            active={segment}
            onHover={(id, src) => hoverSegment(id, src)}
            label={c.donutLabel}
            caption={c.donutCaption}
          />
          {flow && (
            <div className={`donut-detail ${activeCat ? 'is-on' : ''}`} aria-live="polite">
              {activeCat ? (
                <>
                  <p className="donut-detail__head">
                    <span className="donut-detail__swatch" style={{ background: activeCat.color }} aria-hidden="true" />
                    {c.categories[activeCat.id].name}
                  </p>
                  <p className="donut-detail__value">
                    {usd(activeCat.amount)} / {formatNumber(shareOf(activeCat.amount, TOTAL_ROUND), { decimals: 1 })}%
                  </p>
                  <p className="donut-detail__note">{c.categories[activeCat.id].note}</p>
                </>
              ) : (
                <p className="donut-detail__hint">{c.donutHint}</p>
              )}
            </div>
          )}
          <ul className={`legend ${segment ? 'has-active' : ''}`}>
            {INVESTMENT_CATEGORIES.map((cat, i) => (
              <li key={cat.id}>
                <button
                  type="button"
                  className={`legend__row ${segment === cat.id ? 'is-active' : ''}`}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && hoverSegment(cat.id, 'pointer')}
                  onPointerLeave={(e) => e.pointerType === 'mouse' && hoverSegment(null, 'pointer')}
                  onFocus={() => hoverSegment(cat.id, 'focus')}
                  onBlur={() => !pinnedSegment && setSegment(null)}
                  onClick={() => hoverSegment(cat.id, 'tap')}
                  aria-pressed={segment === cat.id}
                >
                  <span className="legend__swatch" style={{ background: cat.color }} aria-hidden="true" />
                  <span className="legend__name">{c.categories[cat.id].name}</span>
                  <span className="legend__amount">
                    <AnimatedCounter value={cat.amount} prefix="$" delay={1.05 + i * 0.09} duration={0.9} />
                  </span>
                  <span className="legend__share">{formatNumber(shareOf(cat.amount, TOTAL_ROUND), { decimals: 1 })}%</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="roadmap__recon">{c.reconciliation(usd(OPERATING_BUDGET), usd(CONTINGENCY_RESERVE), usd(TOTAL_ROUND))}</p>
          <p className="roadmap__statement">{c.statement}</p>
        </div>
      </div>

      <Popover
        open={!!activeCat && !flow}
        anchor={segment ? segmentAnchor(segment) : null}
        placement={
          !segment
            ? 'top'
            : Math.sin(SEGMENT_ANGLES[segment]) < 0
              ? 'left'
              : Math.cos(SEGMENT_ANGLES[segment]) < 0
                ? 'bottom'
                : 'top'
        }
        offset={12}
        className={`segment-tip segment-tip--${activeCat?.id ?? 'none'}`}
      >
        {activeCat && (
          <>
            <span className="segment-tip__name">{c.categories[activeCat.id].name}</span>
            <span className="segment-tip__value">
              {usd(activeCat.amount)} / {formatNumber(shareOf(activeCat.amount, TOTAL_ROUND), { decimals: 1 })}%
            </span>
            <span className="segment-tip__note">{c.categories[activeCat.id].note}</span>
          </>
        )}
      </Popover>

      <Popover
        open={!!activePhase && !flow}
        anchor={phase !== null ? () => phaseRefs.current[phase]?.querySelector('.phase__id')?.getBoundingClientRect() ?? null : null}
        placement="right"
        offset={16}
        role="dialog"
        id="phase-detail"
        className="phase-detail"
      >
        {activePhase && phase !== null && (
          <>
            <p className="phase-detail__tag">
              {c.phaseSelected(pad(phase + 1), activePhase.months, usd(activePhase.budget))}
            </p>
            <p className="phase-detail__headline">{c.phases[activePhase.id as keyof typeof c.phases].headline}</p>
            <p className="phase-detail__text">{c.phases[activePhase.id as keyof typeof c.phases].text}</p>
            <div className="phase-detail__controls">
              <Button variant="outline" size="sm" icon="arrow-left" disabled={phase === 0} onClick={() => setPhase(phase - 1)}>
                {c.previous}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={phase === ROADMAP_PHASES.length - 1}
                onClick={() => setPhase(phase + 1)}
              >
                {c.nextPhase}
              </Button>
              <button type="button" className="phase-detail__close" aria-label={c.close} onClick={() => setPhase(null)}>
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </>
        )}
      </Popover>
    </>
  );
}

export function RoadmapInvestment() {
  return (
    <Slide id="roadmap">
      <Content />
    </Slide>
  );
}
