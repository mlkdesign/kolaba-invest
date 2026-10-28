import { useState } from 'react';
import { Slide } from '../components/Slide';
import { PricingCard } from '../components/PricingCard';
import { useContent } from '../content';
import { PRICING, type BillingCycle, type PlanId } from '../data/pricing';
import { formatNumber } from '../lib/format';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import './BusinessModel.css';

function Content() {
  const c = useContent().business;
  const [selection, setSelection] = useState<{ plan: PlanId; cycle: BillingCycle } | null>(null);

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.business__intro > *'), 0);
    q('.plan').forEach((card, i) => {
      const t = 0.3 + i * 0.2;
      const el = card as HTMLElement;
      tl.from(el, { autoAlpha: 0, y: 56, duration: 0.85, ease: 'power3.out' }, t);
      // Playing-card reveal: the header unfolds from its top edge.
      tl.from(
        el.querySelector('.plan__header'),
        { rotationX: -75, autoAlpha: 0, transformOrigin: '50% 0%', transformPerspective: 1100, duration: 1, ease: 'power3.out' },
        t + 0.2,
      );
      // The CSS `rotate` holds the final ±15°; starting from the opposite angle stacks the cards.
      tl.from(el.querySelector('.plan__mini--left'), { rotation: 15, x: 26, duration: 0.8, ease: 'back.out(1.4)' }, t + 0.5);
      tl.from(el.querySelector('.plan__mini--right'), { rotation: -15, x: -26, duration: 0.8, ease: 'back.out(1.4)' }, t + 0.5);
      tl.from(
        [el.querySelector('.plan__name'), ...el.querySelectorAll('.plan__reveal')],
        { autoAlpha: 0, y: 16, duration: 0.55, stagger: 0.08 },
        t + 0.6,
      );
    });
    reveal(tl, q('.business__note'), 1.2);
  });

  const onSelect = (plan: PlanId, cycle: BillingCycle) => {
    setSelection((s) => (s?.plan === plan && s.cycle === cycle ? null : { plan, cycle }));
  };

  const status = (() => {
    if (!selection) return '';
    const label = c.plans[selection.plan].label;
    const p = selection.plan === 'creatorPro' ? PRICING.creatorPro : PRICING.businessPro;
    const perMonth =
      selection.cycle === 'monthly'
        ? p.monthly
        : 'annualMonthlyEquivalent' in p
          ? p.annualMonthlyEquivalent
          : p.annual.monthlyEquivalent;
    return c.selectionStatus(label, `${formatNumber(perMonth, { prefix: '$', decimals: 2 })}/month`);
  })();

  return (
    <>
      <div className="slide__rule" />
      <div className="business">
        <header className="intro business__intro">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 className="display">
            {c.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
          <p className="business__lead">{c.lead}</p>
        </header>
        {(['creatorPro', 'businessPro'] as const).map((plan) => (
          <PricingCard key={plan} plan={plan} selected={selection?.plan === plan} onSelect={onSelect} />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
      <p className="business__note">{c.note}</p>
    </>
  );
}

export function BusinessModel() {
  return (
    <Slide id="business">
      <Content />
    </Slide>
  );
}
