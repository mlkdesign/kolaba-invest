import { Slide } from '../components/Slide';
import { SlideEyebrow } from '../components/SlideEyebrow';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { useContent } from '../content';
import { PRICING, type PlanId } from '../data/pricing';
import { MARKETING_TOTAL } from '../data/budget';
import { formatNumber } from '../lib/format';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import lockLeft from '../assets/icons/lock-key-left.svg';
import lockRight from '../assets/icons/lock-key-right.svg';
import cardKCreator from '../assets/icons/card-k-creator.svg';
import cardKBusiness from '../assets/icons/card-k-business.svg';
import './BusinessModel.css';
import './BusinessGrowth.css';

const money = (n: number) => formatNumber(n, { prefix: '$', decimals: 2 });
const pad = (n: number) => String(n).padStart(2, '0');
const PLANS: PlanId[] = ['creatorPro', 'businessPro'];

/** Compact subscription summary: name, the price the financial model uses, and the main Pro benefits. */
function PlanSummary({ plan }: { plan: PlanId }) {
  const c = useContent();
  const m = c.model;
  const name = c.business.plans[plan].name;
  const tone = plan === 'creatorPro' ? 'creator' : 'business';
  const price = PRICING[plan];

  return (
    <article className={`plan plan--${tone} mplan`} aria-label={c.business.plans[plan].label}>
      <div className="plan__header">
        <div className="plan__deck" aria-hidden="true">
          <div className="plan__mini plan__mini--left">
            <img src={lockLeft} alt="" />
          </div>
          <div className="plan__mini plan__mini--right">
            <img src={lockRight} alt="" />
          </div>
          <div className="plan__mini plan__mini--center">
            <img src={tone === 'creator' ? cardKCreator : cardKBusiness} alt="" />
          </div>
        </div>
        <h3 className="plan__name">
          {name[0]}
          <span className="plan__dot">{name[1]}</span>
          <span className="plan__accent">{name[2]}</span>
        </h3>
      </div>
      <div className="mplan__body">
        <p className="mplan__price mplan__in">
          <strong>{money(price.monthly)}</strong>
          {m.perMonth}
          <span className="mplan__trial">{c.business.trial(price.trialDays)}</span>
        </p>
        {/* Only the creator annual plan is part of the financial model; Business annual pricing is still pending. */}
        {'annualMonthlyEquivalent' in price && (
          <p className="mplan__alt mplan__in">{m.annualOption(money(price.annualMonthlyEquivalent))}</p>
        )}
        <p className="mplan__text mplan__in">{m.plans[plan].text}</p>
        <ul className="mplan__benefits">
          {m.plans[plan].benefits.map((b) => (
            <li className="mplan__in" key={b}>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Content() {
  const c = useContent().model;

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.bm__intro > *'), 0);
    reveal(tl, q('.bm__revenue > *'), 0.2, { stagger: 0.07 });
    q('.mplan').forEach((card, i) => {
      const t = 0.25 + i * 0.15;
      const el = card as HTMLElement;
      tl.from(el, { autoAlpha: 0, y: 28, duration: 0.8, ease: 'power3.out' }, t);
      // The brand header unfold, shorter than on the product page.
      tl.from(
        el.querySelector('.plan__header'),
        { rotationX: -40, autoAlpha: 0, transformOrigin: '50% 0%', transformPerspective: 1100, duration: 0.8, ease: 'power3.out' },
        t + 0.1,
      );
      tl.from(el.querySelectorAll('.mplan__in'), { autoAlpha: 0, y: 10, duration: 0.6, stagger: 0.05 }, t + 0.3);
    });
    tl.from(q('.bm__step-rule'), { scaleX: 0, duration: 0.7, ease: 'power2.inOut', stagger: 0.12 }, 0.6);
    reveal(tl, q('.bm__growth-label, .bm__step > :not(.bm__step-rule)'), 0.7, { stagger: 0.04 });
    reveal(tl, q('.bm__budget > *'), 0.9, { stagger: 0.07 });
  });

  return (
    <>
      <div className="slide__rule" />
      <div className="bm">
        <div className="bm__left">
          <header className="intro bm__intro">
            <SlideEyebrow />
            <h2 className="display">
              {c.title.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h2>
          </header>
          <div className="bm__revenue">
            <p className="bm__label">{c.revenueLabel}</p>
            <p className="bm__revenue-title">{c.revenue}</p>
            <p className="bm__revenue-note">{c.revenueNote}</p>
          </div>
        </div>
        {PLANS.map((p) => (
          <PlanSummary key={p} plan={p} />
        ))}
      </div>

      <div className="bm__bottom">
        <div className="bm__growth">
          <p className="bm__label bm__growth-label">{c.growthLabel}</p>
          <ol className="bm__steps">
            {c.growth.map((s, i) => (
              <li className="bm__step" key={s.title}>
                <span className="bm__step-rule" aria-hidden="true" />
                <span className="bm__step-num">{pad(i + 1)}</span>
                <h3 className="bm__step-title">{s.title}</h3>
                <p className="bm__step-text">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="bm__budget">
          <p className="bm__label">{c.budgetLabel}</p>
          <p className="bm__budget-value">
            <AnimatedCounter value={MARKETING_TOTAL} prefix="$" delay={0.9} />
          </p>
          <p className="bm__budget-text">{c.budgetText}</p>
        </div>
      </div>
    </>
  );
}

export function BusinessGrowth() {
  return (
    <Slide id="business">
      <Content />
    </Slide>
  );
}
