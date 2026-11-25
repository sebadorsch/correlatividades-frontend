import React, { useEffect, useState } from 'react';
import {
  ELECTIVE_REQUIRED, STATE_LABEL, formatTermType, orderLabel,
} from 'src/services/planStatus.ts';
import { SubjectDetail } from 'src/components/SubjectPanel/SubjectPanel.jsx';
import ElectivesEditor from 'src/components/ElectivesEditor/ElectivesEditor.jsx';
import Icon from 'src/components/Icons/Icon.jsx';

const LEVELS = [1, 2, 3, 4, 5];

// Correlativas a la vista, por número de orden: "Regulares 13, 16 · Aprobadas 05, 06".
function ReqSummary({ subject, byCode }) {
  const codes = (list) => list.map((c) => orderLabel(byCode.get(c)) || c).join(', ');
  const regular = subject.requiredSubjectsToEnroll;
  const approved = subject.requiredSubjectsToPass;
  if (regular.length + approved.length === 0) return <span className="row-reqs">Sin correlativas</span>;
  return (
    <span className="row-reqs">
      {regular.length > 0 && <>Regulares <span className="code">{codes(regular)}</span></>}
      {regular.length > 0 && approved.length > 0 && ' · '}
      {approved.length > 0 && <>Aprobadas <span className="code">{codes(approved)}</span></>}
    </span>
  );
}

// El plan en el celular: los cinco niveles uno debajo del otro, cada materia en una fila con sus
// correlativas a la vista. Tocar una fila la despliega ahí mismo (y, con sesión, permite marcarla).
// Sin statusByCode se muestra neutro (sin sesión).
export default function MobilePlan({
  sorted, byCode, statusByCode, draft, onChange, electives, electiveActions, focus, initialOpen = null, filter = null,
}) {
  const [open, setOpen] = useState(initialOpen);

  // Al elegir una materia desde el resumen: desplegarla y llevarla a la vista.
  useEffect(() => {
    if (!focus) return;
    setOpen(focus.code);
    requestAnimationFrame(() => {
      document.getElementById(`materia-${focus.code}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [focus]);

  const toggle = (key) => setOpen((prev) => (prev === key ? null : key));

  const levelInfo = (level) => {
    const degree = sorted.filter((s) => s.courseYear === level && !s.intermediateTitleOnly);
    const done = statusByCode ? degree.filter((s) => statusByCode.get(s.code)?.state === 'aprobada').length : null;
    return { total: degree.length, done };
  };

  return (
    <div className="mplan">
      <nav className="mplan-nav" aria-label="Ir a un nivel">
        {LEVELS.map((level) => {
          const { total, done } = levelInfo(level);
          return (
            <a key={level} href={`#nivel-${level}`}>
              <span>{level}º</span>
              <small className="num">{done === null ? total : `${done}/${total}`}</small>
            </a>
          );
        })}
      </nav>

      {LEVELS.map((level) => {
        const subjects = sorted.filter((s) => s.courseYear === level);
        const { total, done } = levelInfo(level);
        const electiveKey = `E${level}`;
        const electiveRequired = ELECTIVE_REQUIRED[level];
        const electiveHours = electives?.[level];

        return (
          <section className="mplan-level" id={`nivel-${level}`} key={level} aria-labelledby={`nivel-${level}-t`}>
            <header className="mplan-level-head">
              <h3 id={`nivel-${level}-t`}>{level}º nivel</h3>
              <span className="muted num">
                {done === null ? `${total} materias` : `${done} de ${total} aprobadas`}
              </span>
            </header>

            <ul className="mplan-list">
              {subjects.map((s) => {
                const status = statusByCode?.get(s.code);
                const state = status?.state ?? 'neutral';
                const isOpen = open === s.code;
                return (
                  <li
                    key={s.code}
                    id={`materia-${s.code}`}
                    className={`mrow st-${state} ${isOpen ? 'is-open' : ''} ${filter && state !== filter ? 'is-dim' : ''}`}
                  >
                    <button
                      type="button"
                      className="mrow-head"
                      aria-expanded={isOpen}
                      aria-controls={`materia-${s.code}-detalle`}
                      onClick={() => toggle(s.code)}
                    >
                      <span className="code">{orderLabel(s)}</span>
                      <span className="mrow-body">
                        <span className="mrow-name">{s.name}</span>
                        <ReqSummary subject={s} byCode={byCode} />
                      </span>
                      {state !== 'neutral' && (
                        <span className={`mrow-state st-text-${state}`}>
                          {state === 'aprobada' && <Icon name="check" size={12} />}
                          {STATE_LABEL[state]}
                        </span>
                      )}
                    </button>
                    {isOpen && (
                      <div className="mrow-detail" id={`materia-${s.code}-detalle`}>
                        <p className="muted">
                          {formatTermType(s.termType)} · {s.weeklyHours ?? '—'} h por semana
                        </p>
                        <SubjectDetail
                          subject={s}
                          status={status}
                          byCode={byCode}
                          value={draft?.[s.code] || 'pendiente'}
                          onChange={onChange}
                        />
                      </div>
                    )}
                  </li>
                );
              })}

              {electiveRequired && (
                <li className={`mrow mrow-electives ${open === electiveKey ? 'is-open' : ''} ${filter ? 'is-dim' : ''}`}>
                  <button
                    type="button"
                    className="mrow-head"
                    aria-expanded={open === electiveKey}
                    onClick={() => toggle(electiveKey)}
                  >
                    <span className="code" aria-hidden="true">—</span>
                    <span className="mrow-body">
                      <span className="mrow-name">Electivas</span>
                      <span className="row-reqs num">
                        {electiveHours === undefined
                          ? `${electiveRequired} h semanales, las elige cada facultad`
                          : `${electiveHours} de ${electiveRequired} h aprobadas`}
                      </span>
                    </span>
                  </button>
                  {open === electiveKey && (
                    <div className="mrow-detail">
                      <p className="muted">
                        El plan pide {electiveRequired} horas semanales de electivas en este nivel. Cada facultad elige cuáles ofrece.
                      </p>
                      {electiveActions && <ElectivesEditor level={level} actions={electiveActions} />}
                    </div>
                  )}
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
