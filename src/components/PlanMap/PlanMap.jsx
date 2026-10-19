import React from 'react';
import { STATE_LABEL } from 'src/services/planStatus.ts';

const LEVELS = [1, 2, 3, 4, 5];

// El plan entero en cinco columnas, una por nivel. Sin statusByCode se muestra neutro (sin sesión).
export default function PlanMap({ sorted, statusByCode, selectedCode, onSelect, filter = 'todas' }) {
  const selected = sorted.find((s) => s.code === selectedCode);
  const required = new Set([...(selected?.requiredSubjectsToEnroll || []), ...(selected?.requiredSubjectsToPass || [])]);

  return (
    <div className="map-scroll">
      <div className="map">
        {LEVELS.map((level) => {
          const subjects = sorted.filter((s) => s.courseYear === level);
          const done = statusByCode
            ? subjects.filter((s) => statusByCode.get(s.code)?.state === 'aprobada').length
            : null;
          return (
            <div className="map-col" key={level}>
              <h3 className="map-col-head">
                <span>{level}º nivel</span>
                <span className="num">{done === null ? subjects.length : `${done}/${subjects.length}`}</span>
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
                    {state !== 'neutral' && <span className="map-card-state">{STATE_LABEL[state]}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
