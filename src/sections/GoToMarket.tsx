import { useEffect, useState } from 'react';
import { Slide } from '../components/Slide';
import { SlideEyebrow } from '../components/SlideEyebrow';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { Popover, type Anchor } from '../components/Popover';
import { useContent } from '../content';
import { useSection } from '../engine/SectionContext';
import { MARKETING_ALLOCATION, MARKETING_TOTAL, shareOf } from '../data/budget';
import { formatNumber, usd } from '../lib/format';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import './GoToMarket.css';

const pad = (n: number) => String(n).padStart(2, '0');

function Content() {
  const c = useContent().gtm;
  const [hover, setHover] = useState<{ id: string; anchor: Anchor } | null>(null);
  const { active: sectionActive } = useSection();
  useEffect(() => {
    if (!sectionActive) setHover(null);
  }, [sectionActive]);

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.gtm__intro > *, .gtm__tagline'), 0);
    q('.stage').forEach((stage, i) => {
      const t = 0.3 + i * 0.22;
      tl.from(stage.querySelector('.stage__node'), { scale: 0, duration: 0.45, ease: 'back.out(2)' }, t);
      tl.from(stage.querySelector('.stage__line'), { scaleX: 0, duration: 0.7, ease: 'power2.inOut' }, t + 0.1);
      tl.from(stage.querySelector('.stage__arrow'), { autoAlpha: 0, x: -8, y: 8, duration: 0.4 }, t + 0.55);
      reveal(tl, stage.querySelectorAll('.stage__num, .stage__name, .stage__timing, .stage__text'), t + 0.15, { stagger: 0.06 });
    });
    tl.from(q('.gtm__rule'), { scaleX: 0, duration: 0.9, ease: 'power2.inOut' }, 0.7);
    reveal(tl, q('.gtm__invest > *'), 0.85);
    tl.fromTo(q('.budget__bar'), { clipPath: 'inset(0 100% 0 0 round 9px)' }, { clipPath: 'inset(0 0% 0 0 round 9px)', duration: 1.2, ease: 'power2.inOut' }, 0.95);
    reveal(tl, q('.budget__item'), 1.1, { stagger: 0.08 });
    reveal(tl, q('.gtm__note'), 1.3);
  });

  const active = hover ? MARKETING_ALLOCATION.find((m) => m.id === hover.id) : undefined;

  const enter = (id: string, el: Element) => setHover({ id, anchor: () => el.getBoundingClientRect() });

  return (
    <>
      <div className="slide__rule" />
      <header className="gtm__head">
        <div className="intro gtm__intro">
          <SlideEyebrow />
          <h2 className="display">
            {c.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
        </div>
        <p className="gtm__tagline">{c.tagline}</p>
      </header>

      <ol className="gtm__stages">
        {c.stages.map((s, i) => (
          <li className="stage" key={s.name}>
            <div className="stage__connector" aria-hidden="true">
              <span className={`stage__node ${i === 0 ? 'is-current' : ''}`} />
              <span className="stage__line" />
              <span className="stage__arrow">↗</span>
            </div>
            <span className="stage__num">{pad(i + 1)}</span>
            <h3 className="stage__name">{s.name}</h3>
            <p className="stage__timing">{s.timing}</p>
            <p className="stage__text">{s.text}</p>
          </li>
        ))}
      </ol>

      <div className="gtm__rule" />

      <div className="gtm__marketing">
        <div className="gtm__invest">
          <p className="gtm__total">
            <AnimatedCounter value={MARKETING_TOTAL} prefix="$" delay={0.9} duration={1.3} />
          </p>
          <p className="gtm__invest-text">{c.investmentText}</p>
        </div>

        <figure className="budget">
          <figcaption className="sr-only">{c.allocationLabel}</figcaption>
          <div className={`budget__bar ${hover ? 'has-hover' : ''}`} onPointerLeave={() => setHover(null)}>
            {MARKETING_ALLOCATION.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`budget__segment ${hover?.id === m.id ? 'is-active' : ''}`}
                style={{ flexGrow: m.amount, background: m.color }}
                aria-label={`${c.allocation[m.id]}: ${usd(m.amount)}, ${shareOf(m.amount, MARKETING_TOTAL)}%`}
                onPointerEnter={(e) => enter(m.id, e.currentTarget)}
                onFocus={(e) => enter(m.id, e.currentTarget)}
                onBlur={() => setHover(null)}
                onClick={(e) => (hover?.id === m.id ? setHover(null) : enter(m.id, e.currentTarget))}
              />
            ))}
          </div>
          <ul className="budget__legend">
            {MARKETING_ALLOCATION.map((m, i) => (
              <li
                key={m.id}
                className={`budget__item ${hover && hover.id !== m.id ? 'is-dim' : ''}`}
                onPointerEnter={(e) => enter(m.id, e.currentTarget)}
                onPointerLeave={() => setHover(null)}
              >
                <span className="budget__value">
                  <AnimatedCounter value={m.amount} prefix="$" delay={1.1 + i * 0.08} />
                </span>
                <span className="budget__label">{c.allocation[m.id]}</span>
              </li>
            ))}
          </ul>
        </figure>
      </div>

      <p className="gtm__note">{c.note}</p>

      <Popover open={!!active} anchor={hover?.anchor ?? null} offset={12} className="chart-tip">
        {active && (
          <>
            <span className="chart-tip__name">{c.allocation[active.id]}</span>
            <span className="chart-tip__value">
              {usd(active.amount)} · {formatNumber(shareOf(active.amount, MARKETING_TOTAL), { decimals: 1 })}%
            </span>
          </>
        )}
      </Popover>
    </>
  );
}

export function GoToMarket() {
  return (
    <Slide id="gtm">
      <Content />
    </Slide>
  );
}
