import { useEffect, useId, useState } from 'react';
import { INPUT_LIMITS, type InputKey } from '../data/projections';
import { formatNumber } from '../lib/format';
import { InfoTip } from './InfoTip';

type Props = {
  inputKey: InputKey;
  label: string;
  help: string;
  infoLabel: string;
  editLabel: string;
  value: number;
  percent?: boolean;
  onChange: (key: InputKey, value: number) => void;
};

/** Slider + directly editable value, both bound to the same calculator state. */
export function CalculatorInput({ inputKey, label, help, infoLabel, editLabel, value, percent, onChange }: Props) {
  const { min, max, step } = INPUT_LIMITS[inputKey];
  const id = useId();
  const display = formatNumber(value, { suffix: percent ? '%' : '' });
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => setDraft(null), [value]);

  const commit = () => {
    if (draft == null) return;
    const parsed = Number(draft.replace(/[^\d.]/g, ''));
    setDraft(null);
    if (draft.trim() === '' || !Number.isFinite(parsed)) return;
    onChange(inputKey, Math.round(parsed));
  };

  const fill = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className="calc-input">
      <div className="calc-input__row">
        <label className="calc-input__label" htmlFor={id}>
          {label}
        </label>
        <InfoTip label={infoLabel}>{help}</InfoTip>
        <input
          className="calc-input__value"
          type="text"
          inputMode="numeric"
          aria-label={editLabel}
          value={draft ?? display}
          onFocus={(e) => {
            setDraft(String(value));
            requestAnimationFrame(() => e.target.select());
          }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit();
              (e.target as HTMLInputElement).blur();
            } else if (e.key === 'Escape') {
              setDraft(null);
              (e.target as HTMLInputElement).blur();
            }
          }}
          size={Math.max(3, display.length)}
        />
      </div>
      <input
        id={id}
        className="calc-input__range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        style={{ '--fill': `${fill}%` } as React.CSSProperties}
        onChange={(e) => onChange(inputKey, Number(e.target.value))}
      />
    </div>
  );
}
