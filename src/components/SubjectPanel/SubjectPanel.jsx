import React from 'react';
import { formatTermType, orderLabel, STATE_LABEL } from 'src/services/planStatus.ts';
import StateChoice from 'src/components/StateChoice/StateChoice.jsx';
import Icon from 'src/components/Icons/Icon.jsx';

const Requirement = ({ subject, fallback, kind, missing }) => (
  <li className={missing === undefined ? 'req' : missing ? 'req is-missing' : 'req is-ok'}>
    <span className="req-icon">
      <Icon name={missing === undefined ? 'dot' : missing ? 'alert' : 'check'} />
    </span>
    <span className="code">{orderLabel(subject)}</span>
    <span>
      {subject?.name ?? fallback}
      <small>{kind}{missing ? ' · te falta' : ''}</small>
    </span>
  </li>
);

// Cuerpo del detalle: nota del Analista, correlativas y, con sesión, tu situación.
// Lo usan el panel de escritorio y la fila desplegada del celular.
export function SubjectDetail({ subject, status, byCode, value, onChange }) {
  const regular = subject.requiredSubjectsToEnroll;
  const approved = subject.requiredSubjectsToPass;

  return (
    <>
      {subject.intermediateTitleOnly && (
        <p className="panel-note-box">
          Solo la pide el título intermedio de Analista. Es la última materia de ese título: para rendirla
          tenés que tener aprobadas todas las demás materias de 1º a 3º nivel.
        </p>
      )}

      {regular.length + approved.length === 0 ? (
        <p className="muted">No tiene correlativas, la podés cursar desde el principio</p>
      ) : (
        <>
          <h3 className="panel-label">Para cursarla necesitás</h3>
          <ul className="reqs">
            {regular.map((code) => (
              <Requirement
                key={`r${code}`}
                subject={byCode.get(code)}
                fallback={code}
                kind="Regular"
                missing={status ? status.missingRegular.includes(code) : undefined}
              />
            ))}
            {approved.map((code) => (
              <Requirement
                key={`a${code}`}
                subject={byCode.get(code)}
                fallback={code}
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
    </>
  );
}

// Detalle de una materia en escritorio: qué pide para cursarla y, con sesión, tu situación.
export default function SubjectPanel({ subject, status, byCode, value, onChange }) {
  if (!subject) return null;

  return (
    <aside className="subject-panel" aria-live="polite">
      <div className="panel-kicker">
        <span className="code">{orderLabel(subject)}</span>
        {status && <span className={`tag tag-${status.state}`}>{STATE_LABEL[status.state]}</span>}
      </div>
      <h2>{subject.name}</h2>
      <p className="muted">
        {subject.courseYear}º nivel · {formatTermType(subject.termType)} · {subject.weeklyHours ?? '—'} h por semana
      </p>
      <SubjectDetail subject={subject} status={status} byCode={byCode} value={value} onChange={onChange} />
    </aside>
  );
}
