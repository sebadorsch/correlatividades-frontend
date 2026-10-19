import React from 'react';
import { ELECTIVE_REQUIRED, STATE_LABEL } from 'src/services/planStatus.ts';

const LEVELS = [1, 2, 3, 4, 5];

// El plan entero en cinco columnas, una por nivel. Sin statusByCode se muestra neutro (sin sesión).
// Los niveles 3 a 5 cierran con una tarjeta de electivas; su selección es 'E3', 'E4' o 'E5'.
export default function PlanMap({ sorted, statusByCode, electives, selectedCode, onSelect, filter = 'todas' }) {
  const selected = sorted.find((s) => s.code === selectedCode);
  const required = new Set([...(selected?.requiredSubjectsToEnroll || []), ...(selected?.requiredSubjectsToPass || [])]);

  return (
    <div className="map-scroll">
      <div className="map">
        {LEVELS.map((level) => {
          const subjects = sorted.filter((s) => s.courseYear === level);
          const degree = subjects.filter((s) => !s.intermediateTitleOnly);
          const done = statusByCode
            ? degree.filter((s) => statusByCode.get(s.code)?.state === 'aprobada').length
            : null;
          const electiveKey = `E${level}`;
          const electiveRequired = ELECTIVE_REQUIRED[level];
          const electiveHours = electives?.[level];
          return (
            <div className="map-col" key={level}>
              <h3 className="map-col-head">
                <span>{level}º nivel</span>
                <span className="num">{done === null ? degree.length : `${done}/${degree.length}`}</span>
              </h3>
              {subjects.map((s) => {
                const state = statusByCode?.get(s.code)?.state ?? 'neutral';
                const dim = filter !== 'todas' && state !== filter;
                const classes = [
                  'map-card',
                  `st-${state}`,
                  dim ? 'is-dim' : '',
                  s.code === selectedCode ? 'is-selected' : '',
                  required.has(s.code) ? 'is-required' : '',
                ].join(' ');
                return (
                  <button
                    key={s.code}
                    type="button"
                    className={classes}
                    onClick={() => onSelect(s.code)}
                    aria-pressed={s.code === selectedCode}
                  >
                    <span className="map-card-name">{s.name}</span>
                    {s.intermediateTitleOnly && <span className="map-card-note">Solo título de Analista</span>}
                    {state !== 'neutral' && <span className="map-card-state">{STATE_LABEL[state]}</span>}
                  </button>
                );
              })}
              {electiveRequired && (
                <button
                  type="button"
                  className={[
                    'map-card',
                    'map-card-electives',
                    electiveHours !== undefined && electiveHours >= electiveRequired ? 'is-complete' : '',
                    filter !== 'todas' ? 'is-dim' : '',
                    selectedCode === electiveKey ? 'is-selected' : '',
                  ].join(' ')}
                  onClick={() => onSelect(electiveKey)}
                  aria-pressed={selectedCode === electiveKey}
                >
                  <span className="map-card-name">Electivas</span>
                  <span className="map-card-state num">
                    {electiveHours === undefined ? `${electiveRequired} h semanales` : `${electiveHours} de ${electiveRequired} h`}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
