import React from 'react';
import { ELECTIVE_REQUIRED } from 'src/services/planStatus.ts';
import ElectivesEditor from 'src/components/ElectivesEditor/ElectivesEditor.jsx';

// Detalle de las electivas de un nivel: cuántas horas pide el plan, cuántas aprobaste y cuáles son.
// Sin sesión (sin actions) solo explica qué pide el plan.
export default function ElectivesPanel({ level, hours, actions }) {
  const required = ELECTIVE_REQUIRED[level];
  const known = hours !== undefined;
  const done = known ? Math.min(hours, required) : 0;
  const complete = known && hours >= required;

  return (
    <aside className="subject-panel" aria-live="polite">
      {known && (
        <span className={`tag ${complete ? 'tag-disponible' : 'tag-bloqueada'}`}>
          {complete ? 'Completas' : `Te faltan ${required - hours} h`}
        </span>
      )}
      <h2>Electivas de {level}º nivel</h2>
      <p className="muted">
        El plan pide {required} horas semanales de electivas en este nivel. Cada facultad elige cuáles ofrece.
      </p>
      {known && (
        <>
          <div className="bar" role="img" aria-label={`${done} de ${required} horas`}>
            <i style={{ width: `${(done / required) * 100}%` }} />
          </div>
          <p className="num">{hours} de {required} h aprobadas</p>
        </>
      )}
      {actions && <ElectivesEditor level={level} actions={actions} />}
    </aside>
  );
}
