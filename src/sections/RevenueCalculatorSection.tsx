import { useCallback, useMemo, useState } from 'react';
import { Slide } from '../components/Slide';
import { SlideEyebrow } from '../components/SlideEyebrow';
import { RevenueCalculator } from '../components/RevenueCalculator';
import { ScenarioChart } from '../components/ScenarioChart';
import { useContent } from '../content';
import { DEFAULT_SCENARIO, PRESETS, type InputKey, type ScenarioId, type ScenarioInputs } from '../data/projections';
import { calculateScenario, clampInput } from '../lib/revenue';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import './RevenueCalculator.css';

function Content() {
  const c = useContent().calculator;
  const [scenario, setScenario] = useState<ScenarioId>(DEFAULT_SCENARIO);
  const [inputs, setInputs] = useState<ScenarioInputs>(PRESETS[DEFAULT_SCENARIO]);
  const result = useMemo(() => calculateScenario(inputs), [inputs]);

  const onPreset = useCallback((id: ScenarioId) => {
    setScenario(id);
    if (id !== 'custom') setInputs(PRESETS[id]);
  }, []);

  const onInput = useCallback((key: InputKey, value: number) => {
    setInputs((prev) => {
      const next = clampInput(key, value);
      return prev[key] === next ? prev : { ...prev, [key]: next };
    });
    setScenario('custom');
  }, []);

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.calc-section__intro > *'), 0);
    tl.from(q('.calc'), { autoAlpha: 0, y: 40, duration: 0.85 }, 0.2);
    reveal(tl, q('.calc__tabs, .calc__caption, .calc-input, .calc__mrr, .calc__result'), 0.35, { stagger: 0.05, y: 16 });
    reveal(tl, q('.scenario-bar__meta'), 0.5, { stagger: 0.1 });
  });

  return (
    <>
      <div className="slide__rule" />
      <div className="calc-section">
        <div className="calc-section__left">
          <header className="intro calc-section__intro">
            <SlideEyebrow />
            <h2 className="display">
              {c.title.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h2>
            <p className="calc-section__lead">{c.lead}</p>
          </header>
          <ScenarioChart scenario={scenario} customMrr={result.grossMrr} />
        </div>
        <RevenueCalculator scenario={scenario} inputs={inputs} result={result} onPreset={onPreset} onInput={onInput} />
      </div>
    </>
  );
}

export function RevenueCalculatorSection() {
  return (
    <Slide id="calculator">
      <Content />
    </Slide>
  );
}
