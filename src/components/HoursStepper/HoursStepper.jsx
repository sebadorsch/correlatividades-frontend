import React from 'react';

// Número de horas semanales con botones de − y +.
export default function HoursStepper({ id, label, value, onChange, min = 1, max = 60 }) {
  const clamp = (n) => Math.max(min, Math.min(max, n));
  return (
    <div className="stepper">
      <button type="button" aria-label="Restar una hora" onClick={() => onChange(clamp(value - 1))} disabled={value <= min}>−</button>
      <label className="visually-hidden" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
      />
      <button type="button" aria-label="Sumar una hora" onClick={() => onChange(clamp(value + 1))} disabled={value >= max}>+</button>
    </div>
  );
}
