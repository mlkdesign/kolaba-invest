import { useState } from 'react';
import { PRICING, type BillingCycle, type PlanId } from '../data/pricing';
import { useContent } from '../content';
import { formatNumber } from '../lib/format';
import lockLeft from '../assets/icons/lock-key-left.svg';
import lockRight from '../assets/icons/lock-key-right.svg';
import cardKCreator from '../assets/icons/card-k-creator.svg';
import cardKBusiness from '../assets/icons/card-k-business.svg';
import radioOnCreator from '../assets/icons/radio-on-creator.svg';
import radioOffCreator from '../assets/icons/radio-off-creator.svg';
import radioOnBusiness from '../assets/icons/radio-on-business.svg';
import radioOffBusiness from '../assets/icons/radio-off-business.svg';
import lockOpenCreator from '../assets/icons/lock-open-creator.svg';
import lockOpenBusiness from '../assets/icons/lock-open-business.svg';

const money = (n: number) => formatNumber(n, { prefix: '$', decimals: 2 });

const ICONS = {
  creatorPro: { k: cardKCreator, on: radioOnCreator, off: radioOffCreator, lock: lockOpenCreator },
  businessPro: { k: cardKBusiness, on: radioOnBusiness, off: radioOffBusiness, lock: lockOpenBusiness },
};

function priceFor(plan: PlanId, cycle: BillingCycle) {
  if (plan === 'creatorPro') {
    const p = PRICING.creatorPro;
    return cycle === 'yearly'
      ? { perMonth: p.annualMonthlyEquivalent, total: p.annualTotal, trial: p.trialDays }
      : { perMonth: p.monthly, total: null, trial: p.trialDays };
  }
  const p = PRICING.businessPro;
  return cycle === 'yearly'
    ? { perMonth: p.annual.monthlyEquivalent, total: p.annual.total, trial: p.trialDays }
    : { perMonth: p.monthly, total: null, trial: p.trialDays };
}

type Props = {
  plan: PlanId;
  selected: boolean;
  onSelect: (plan: PlanId, cycle: BillingCycle) => void;
};

/** Subscription card (creator.pro / business.pro). Interactive, but no checkout: this is an investor deck. */
export function PricingCard({ plan, selected, onSelect }: Props) {
  const c = useContent().business;
  const copy = c.plans[plan];
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const icons = ICONS[plan];
  const tone = plan === 'creatorPro' ? 'creator' : 'business';
  const current = priceFor(plan, cycle);

  const choose = (next: BillingCycle) => {
    setCycle(next);
    if (selected) onSelect(plan, next);
  };

  const onRadioKey = (e: React.KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const next = cycle === 'yearly' ? 'monthly' : 'yearly';
      choose(next);
      (e.currentTarget.parentElement?.querySelector(`[data-cycle="${next}"]`) as HTMLElement | null)?.focus();
    }
  };

  return (
    <article className={`plan plan--${tone} ${selected ? 'is-selected' : ''}`} aria-label={copy.label}>
      <div className="plan__header">
        <div className="plan__deck" aria-hidden="true">
          <div className="plan__mini plan__mini--left">
            <img src={lockLeft} alt="" />
          </div>
          <div className="plan__mini plan__mini--right">
            <img src={lockRight} alt="" />
          </div>
          <div className="plan__mini plan__mini--center">
            <img src={icons.k} alt="" />
          </div>
        </div>
        <h3 className="plan__name">
          {copy.name[0]}
          <span className="plan__dot">{copy.name[1]}</span>
          <span className="plan__accent">{copy.name[2]}</span>
        </h3>
      </div>

      <div className="plan__options" role="radiogroup" aria-label={c.billingLabel(copy.label)}>
        {(['yearly', 'monthly'] as const).map((opt) => {
          const p = priceFor(plan, opt);
          const isOn = cycle === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={isOn}
              tabIndex={isOn ? 0 : -1}
              data-cycle={opt}
              className={`plan__option plan__reveal ${isOn ? 'is-on' : ''}`}
              onClick={() => choose(opt)}
              onKeyDown={onRadioKey}
            >
              <span className="plan__option-text">
                <span className="plan__option-title">
                  {opt === 'yearly' ? c.yearly : c.monthly}
                  {opt === 'yearly' && <span className="plan__trial">{c.trial(p.trial)}</span>}
                </span>
                <span className="plan__option-detail">
                  {opt === 'yearly' && p.total != null ? c.yearlyDetail(money(p.perMonth), money(p.total)) : c.monthlyDetail(money(p.perMonth))}
                </span>
              </span>
              <img className="plan__radio" src={isOn ? icons.on : icons.off} alt="" />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="plan__cta plan__reveal"
        aria-pressed={selected}
        onClick={() => onSelect(plan, cycle)}
      >
        <span className="plan__cta-label">
          {selected ? `✓ ${c.selected(copy.label)}` : c.select(copy.label)} · {money(current.perMonth)}/mo
        </span>
        <img src={icons.lock} alt="" className="plan__cta-icon" />
      </button>

      <div className="plan__features plan__reveal">
        <div className="plan__col">
          <p className="plan__col-title">{c.free}</p>
          <ul>
            {copy.free.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div className="plan__col plan__col--pro">
          <p className="plan__col-title">{c.proUpgrade}</p>
          <ul>
            {copy.pro.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
