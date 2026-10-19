import React from 'react';

// Horas semanales de electivas aprobadas en un nivel, con botones de − y +.
export default function HoursStepper({ level, value, onChange }) {
  const id = `electivas-${level}`;
  return (
    <div className="stepper">
      <button type="button" aria-label="Restar una hora" onClick={() => onChange(level, (h) => h - 1)} disabled={value <= 0}>−</button>
      <label className="visually-hidden" htmlFor={id}>Horas de electivas aprobadas en {level}º nivel</label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min="0"
        max="60"
        value={value}
        onChange={(e) => onChange(level, Number(e.target.value) || 0)}
      />
      <button type="button" aria-label="Sumar una hora" onClick={() => onChange(level, (h) => h + 1)}>+</button>
    </div>
  );
}
