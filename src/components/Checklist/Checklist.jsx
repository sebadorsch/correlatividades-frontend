import React, { useEffect, useState } from 'react';
import { formatTermType, joinNames } from 'src/services/planStatus.ts';
import StateChoice from 'src/components/StateChoice/StateChoice.jsx';
import HoursStepper from 'src/components/HoursStepper/HoursStepper.jsx';
import { ELECTIVE_REQUIRED } from 'src/services/planStatus.ts';

const LEVELS = [1, 2, 3, 4, 5];

const Ring = ({ done, total }) => {
  const r = 10;
  const c = 2 * Math.PI * r;
  return (
    <svg className="ring" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r={r} fill="none" className="ring-track" strokeWidth="4" />
      <circle
        cx="13" cy="13" r={r} fill="none" className="ring-fill" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${c * (done / total)} ${c}`} transform="rotate(-90 13 13)"
      />
    </svg>
  );
};

// Carga de materias en el celular: un desplegable por nivel y tres botones grandes por materia.
export default function Checklist({
  sorted, statusByCode, byCode, draft, onChange, electives, onElectivesChange, initialOpen, focus,
}) {
  const [open, setOpen] = useState(() => new Set(initialOpen));

  // Al elegir una materia desde el resumen: abrir su nivel y llevarla a la vista.
  useEffect(() => {
    if (!focus) return;
    const level = byCode.get(focus.code)?.courseYear;
    if (level) setOpen((prev) => new Set(prev).add(level));
    requestAnimationFrame(() => {
      document.getElementById(`materia-${focus.code}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [focus]);

  const toggle = (level) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(level)) next.delete(level); else next.add(level);
    return next;
  });

  return (
    <div className="checklist">
      {LEVELS.map((level) => {
        const subjects = sorted.filter((s) => s.courseYear === level);
        const degree = subjects.filter((s) => !s.intermediateTitleOnly);
        const done = degree.filter((s) => statusByCode.get(s.code)?.state === 'aprobada').length;
        const electiveRequired = ELECTIVE_REQUIRED[level];
        const isOpen = open.has(level);
        return (
          <section className={`level ${isOpen ? 'is-open' : ''}`} key={level}>
            <button
              type="button"
              className="level-head"
              aria-expanded={isOpen}
              onClick={() => toggle(level)}
            >
              <h3>{level}º nivel</h3>
              <span className="muted num">{done} de {degree.length}</span>
              <Ring done={done} total={degree.length} />
            </button>
            {isOpen && (
              <ul className="level-items">
                {subjects.map((s) => {
                  const status = statusByCode.get(s.code);
                  const missing = [
                    ...status.missingRegular.map((c) => `regularizar ${byCode.get(c)?.name ?? c}`),
                    ...status.missingApproved.map((c) => `aprobar ${byCode.get(c)?.name ?? c}`),
                  ];
                  return (
                    <li className="item" key={s.code} id={`materia-${s.code}`}>
                      <span className="item-name">{s.name}</span>
                      {s.intermediateTitleOnly && <span className="item-note">Solo título de Analista</span>}
                      {status.state === 'disponible' && <span className="item-hint is-go">Podés cursarla</span>}
                      {status.state === 'bloqueada' && <span className="item-hint">Te falta {joinNames(missing)}</span>}
                      {(status.state === 'aprobada' || status.state === 'regular') && (
                        <span className="item-hint">{formatTermType(s.termType)} · {s.weeklyHours ?? '—'} h</span>
                      )}
                      <StateChoice
                        code={s.code}
                        name={s.name}
                        value={draft[s.code] || 'pendiente'}
                        onChange={onChange}
                      />
                    </li>
                  );
                })}
                {electiveRequired && (
                  <li className="item">
                    <span className="item-name">Electivas</span>
                    <span className="item-hint">
                      El plan pide {electiveRequired} h semanales. Cargá las horas de las electivas que aprobaste:
                      {' '}<span className="num">{electives[level]} de {electiveRequired} h</span>.
                    </span>
                    <HoursStepper level={level} value={electives[level]} onChange={onElectivesChange} />
                  </li>
                )}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
