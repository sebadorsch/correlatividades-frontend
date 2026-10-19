import React from 'react';

const OPTIONS = [['pendiente', 'Pendiente'], ['regular', 'Regular'], ['aprobada', 'Aprobada']];

export default function StateChoice({ code, name, value, onChange }) {
  return (
    <div className="choice" role="group" aria-label={`Tu situación en ${name}`}>
      {OPTIONS.map(([option, label]) => (
        <button
          key={option}
          type="button"
          data-v={option}
          aria-pressed={value === option}
          onClick={() => onChange(code, option)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
