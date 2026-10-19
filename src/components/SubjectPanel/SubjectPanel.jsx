import React from 'react';
import { formatTermType, STATE_LABEL } from 'src/services/planStatus.ts';
import StateChoice from 'src/components/StateChoice/StateChoice.jsx';

const Requirement = ({ name, kind, missing }) => (
  <li className={missing === undefined ? 'req' : missing ? 'req is-missing' : 'req is-ok'}>
    <span className="req-icon" aria-hidden="true">{missing === undefined ? '' : missing ? '!' : '✓'}</span>
    <span>
      {name}
      <small>{kind}{missing ? ' · te falta' : ''}</small>
    </span>
  </li>
);

// Detalle de una materia: qué pide para cursarla y, con sesión, tu situación.
export default function SubjectPanel({ subject, status, byCode, value, onChange }) {
  if (!subject) return null;

  const regular = subject.requiredSubjectsToEnroll;
  const approved = subject.requiredSubjectsToPass;

  return (
    <aside className="subject-panel" aria-live="polite">
      {status && <span className={`tag tag-${status.state}`}>{STATE_LABEL[status.state]}</span>}
      <h2>{subject.name}</h2>
      <p className="muted">
        {subject.courseYear}º nivel · {formatTermType(subject.termType)} · {subject.weeklyHours ?? '—'} h por semana
      </p>
      {subject.intermediateTitleOnly && (
        <p className="panel-note-box">
          Solo la pide el título intermedio de Analista. Es la última materia de ese título: para rendirla
          tenés que tener aprobadas todas las demás materias de 1º a 3º nivel.
        </p>
      )}

      {regular.length + approved.length === 0 ? (
        <p className="muted">No tiene correlativas: la podés cursar desde el principio.</p>
      ) : (
        <>
          <h3 className="panel-label">Para cursarla necesitás</h3>
          <ul className="reqs">
            {regular.map((code) => (
              <Requirement
                key={`r${code}`}
                name={byCode.get(code)?.name ?? code}
                kind="Regular"
                missing={status ? status.missingRegular.includes(code) : undefined}
              />
            ))}
            {approved.map((code) => (
              <Requirement
                key={`a${code}`}
                name={byCode.get(code)?.name ?? code}
                kind="Aprobada"
                missing={status ? status.missingApproved.includes(code) : undefined}
              />
            ))}
          </ul>
        </>
      )}

      {onChange && (
        <>
          <h3 className="panel-label">Tu situación</h3>
          <StateChoice code={subject.code} name={subject.name} value={value} onChange={onChange} />
        </>
      )}
    </aside>
  );
}
