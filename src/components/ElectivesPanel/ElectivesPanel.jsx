import React from 'react';
import { ELECTIVE_REQUIRED } from 'src/services/planStatus.ts';
import HoursStepper from 'src/components/HoursStepper/HoursStepper.jsx';

// Detalle de las electivas de un nivel: cuántas horas pide el plan y cuántas aprobaste.
export default function ElectivesPanel({ level, hours, onChange }) {
  const required = ELECTIVE_REQUIRED[level];
  const known = hours !== undefined;
  const done = known ? Math.min(hours, required) : 0;
  const complete = known && hours >= required;

  return (
    <aside className="subject-panel" aria-live="polite">
      {known && (
        <span className={`tag ${complete ? 'tag-aprobada' : 'tag-bloqueada'}`}>
          {complete ? 'Completas' : `Te faltan ${required - hours} h`}
        </span>
      )}
      <h2>Electivas de {level}º nivel</h2>
      <p className="muted">
        El plan pide {required} horas semanales de electivas en este nivel. Las elige y las ofrece cada facultad.
      </p>
      {known && (
        <>
          <div className="bar" role="img" aria-label={`${done} de ${required} horas`}>
            <i style={{ width: `${(done / required) * 100}%` }} />
          </div>
          <p className="num">{hours} de {required} h aprobadas</p>
        </>
      )}
      {onChange && (
        <>
          <h3 className="panel-label">Horas semanales que aprobaste</h3>
          <p className="muted">Sumá las horas semanales de cada electiva de {level}º nivel que tengas aprobada.</p>
          <HoursStepper level={level} value={hours} onChange={onChange} />
        </>
      )}
    </aside>
  );
}
