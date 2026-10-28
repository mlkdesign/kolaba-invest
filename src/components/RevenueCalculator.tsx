import { useEffect, useMemo, useState } from 'react';
import { useContent } from '../content';
import {
  INPUT_ORDER,
  PRESET_ORDER,
  type InputKey,
  type ScenarioId,
  type ScenarioInputs,
} from '../data/projections';
import type { ScenarioResult } from '../lib/revenue';
import { usd, int } from '../lib/format';
import { AnimatedCounter } from './AnimatedCounter';
import { CalculatorInput } from './CalculatorInput';
import { InfoTip } from './InfoTip';

type Props = {
  scenario: ScenarioId;
  inputs: ScenarioInputs;
  result: ScenarioResult;
  onPreset: (id: ScenarioId) => void;
  onInput: (key: InputKey, value: number) => void;
};

const PERCENT_KEYS: InputKey[] = ['creatorConversion', 'businessConversion', 'annualShare'];

/** Planning controls + results card (Figma "Finance / Base"). */
export function RevenueCalculator({ scenario, inputs, result, onPreset, onInput }: Props) {
  const c = useContent().calculator;
  const tabs: ScenarioId[] = [...PRESET_ORDER, 'custom'];

  // Announce results politely once the user pauses.
  const [announce, setAnnounce] = useState('');
  const summary = c.liveSummary(usd(result.grossMrr), int(result.payingSubscribers));
  useEffect(() => {
    const id = window.setTimeout(() => setAnnounce(summary), 700);
    return () => window.clearTimeout(id);
  }, [summary]);

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    onPreset(next);
    (e.currentTarget.parentElement?.querySelector(`[data-tab="${next}"]`) as HTMLElement | null)?.focus();
  };

  const results = useMemo(
    () => [
      { key: 'proceeds', value: result.appStoreProceeds, prefix: '$', label: c.results.proceeds, help: c.results.proceedsHelp },
      { key: 'runRate', value: result.annualizedRunRate, prefix: '$', label: c.results.runRate, help: c.results.runRateHelp },
      { key: 'subs', value: result.payingSubscribers, prefix: '', label: c.results.subscribers, help: null },
    ],
    [result, c],
  );

  return (
    <div className="calc">
      <div className="calc__tabs" role="radiogroup" aria-label={c.chartLabel}>
        {tabs.map((t, i) => (
          <button
            key={t}
            type="button"
            role="radio"
            data-tab={t}
            aria-checked={scenario === t}
            tabIndex={scenario === t ? 0 : -1}
            className={`calc__tab ${scenario === t ? 'is-active' : ''}`}
            onClick={() => onPreset(t)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {c.tabs[t]}
          </button>
        ))}
      </div>

      <p className="calc__caption">{c.caption}</p>

      <div className="calc__controls">
        {INPUT_ORDER.map((key) => (
          <CalculatorInput
            key={key}
            inputKey={key}
            label={c.inputs[key].label}
            help={c.inputs[key].help}
            infoLabel={c.infoLabel(c.inputs[key].label)}
            editLabel={c.editValue(c.inputs[key].label)}
            value={inputs[key]}
            percent={PERCENT_KEYS.includes(key)}
            onChange={onInput}
          />
        ))}
      </div>

      <div className="calc__divider" />

      <div className="calc__mrr">
        <span className="calc__mrr-value">
          <AnimatedCounter value={result.grossMrr} prefix="$" delay={0.5} />
        </span>
        <span className="calc__mrr-label">
          {c.results.grossMrr}
          <InfoTip label={c.infoLabel(c.results.grossMrr)}>{c.results.grossMrrHelp}</InfoTip>
        </span>
      </div>

      <div className="calc__results">
        {results.map((r) => (
          <div className="calc__result" key={r.key}>
            <span className="calc__result-value">
              <AnimatedCounter value={r.value} prefix={r.prefix} delay={0.6} />
            </span>
            <span className="calc__result-label">
              {r.label}
              {r.help && <InfoTip label={c.infoLabel(r.label)}>{r.help}</InfoTip>}
            </span>
          </div>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
