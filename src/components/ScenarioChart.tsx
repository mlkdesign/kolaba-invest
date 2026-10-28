import { useEffect, useRef, useState } from 'react';
import { useContent } from '../content';
import { PRESETS, PRESET_ORDER, type ScenarioId } from '../data/projections';
import { calculateScenario } from '../lib/revenue';
import { int, usd } from '../lib/format';
import { useRevealTrigger } from '../hooks/useRevealTrigger';
import { AnimatedCounter } from './AnimatedCounter';

const PRESET_MRR = Object.fromEntries(PRESET_ORDER.map((id) => [id, calculateScenario(PRESETS[id]).grossMrr])) as Record<
  (typeof PRESET_ORDER)[number],
  number
>;

type Props = { scenario: ScenarioId; customMrr: number };

/** Gross MRR of the three presets; the user's custom scenario is drawn as a marker line. */
export function ScenarioChart({ scenario, customMrr }: Props) {
  const c = useContent().calculator;
  const figureRef = useRef<HTMLElement>(null);
  const { active } = useRevealTrigger(figureRef);
  const [grown, setGrown] = useState(false);

  // Bars grow in after the slide activates (CSS transition) and reset when it leaves.
  useEffect(() => {
    if (!active) {
      setGrown(false);
      return;
    }
    const id = window.setTimeout(() => setGrown(true), 60);
    return () => window.clearTimeout(id);
  }, [active]);

  const isCustom = scenario === 'custom';
  const max = Math.max(...Object.values(PRESET_MRR), isCustom ? customMrr : 0, 1);
  const g = grown ? 1 : 0;

  return (
    <figure ref={figureRef} className={`scenario-chart ${grown ? 'is-grown' : ''}`} aria-label={c.chartLabel}>
      <div className="scenario-chart__bars">
        {PRESET_ORDER.map((id) => {
          const p = PRESETS[id];
          const h = (PRESET_MRR[id] / max) * g;
          return (
            <div key={id} className={`scenario-bar scenario-bar--${id} ${scenario === id ? 'is-active' : ''}`} style={{ '--h': h } as React.CSSProperties}>
              <div className="scenario-bar__plot">
                <span className="scenario-bar__value">
                  <AnimatedCounter value={PRESET_MRR[id]} prefix="$" delay={0.35} />
                </span>
                <span className="scenario-bar__fill" />
              </div>
              <div className="scenario-bar__meta">
                <p className="scenario-bar__name">{c.scenarioNames[id]}</p>
                <p>{c.scenarioAudience(int(p.creatorProfiles), int(p.businessProfiles))}</p>
                <p>{c.scenarioConversion(p.creatorConversion, p.businessConversion)}</p>
              </div>
            </div>
          );
        })}
        <div
          className={`scenario-chart__marker ${isCustom ? 'is-visible' : ''}`}
          style={{ '--h': (customMrr / max) * g } as React.CSSProperties}
          aria-hidden={!isCustom}
        >
          <span className="scenario-chart__marker-label">
            {c.scenarioNames.custom} · {usd(customMrr)}
          </span>
        </div>
      </div>
    </figure>
  );
}
