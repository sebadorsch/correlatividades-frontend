import React, { useEffect, useState } from 'react';
import PlanMap from 'src/components/PlanMap/PlanMap.jsx';
import SubjectPanel from 'src/components/SubjectPanel/SubjectPanel.jsx';
import Checklist from 'src/components/Checklist/Checklist.jsx';
import ElectivesPanel from 'src/components/ElectivesPanel/ElectivesPanel.jsx';

const PHONE_QUERY = '(max-width: 760px)';

const useIsPhone = () => {
  const [isPhone, setIsPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(PHONE_QUERY);
    const onChange = () => setIsPhone(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return isPhone;
};

// Tu plan, editable: mapa por niveles en escritorio y checklist en el celular.
export default function PlanSection({
  sorted, byCode, draft, statusByCode, setSubjectState, electives, setElectiveHours, selectedCode, onSelect, focus,
}) {
  const electiveLevel = typeof selectedCode === 'string' ? Number(selectedCode.slice(1)) : null;
  const isPhone = useIsPhone();
  const [filter, setFilter] = useState('todas');

  const count = (state) => sorted.filter((s) => statusByCode.get(s.code)?.state === state).length;
  const firstOpenLevel = sorted.find((s) => statusByCode.get(s.code)?.state !== 'aprobada')?.courseYear ?? 1;

  return (
    <section className="plan-section" id="mi-plan" aria-labelledby="mi-plan-title">
      <div className="plan-head">
        <div>
          <h2 id="mi-plan-title" className="section-title">Tu plan de estudio</h2>
          <p className="muted section-sub">
            {isPhone
              ? 'Marcá cómo te fue en cada materia.'
              : 'Tocá una materia para ver sus correlativas y cambiar tu situación.'}
          </p>
        </div>
        {!isPhone && (
          <div className="filters" role="group" aria-label="Resaltar en el mapa">
            {[['todas', 'Todas'], ['disponible', `Podés cursar · ${count('disponible')}`], ['bloqueada', `Bloqueadas · ${count('bloqueada')}`]].map(([key, label]) => (
              <button key={key} type="button" className="filter" aria-pressed={filter === key} onClick={() => setFilter(key)}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isPhone ? (
        <Checklist
          sorted={sorted}
          statusByCode={statusByCode}
          byCode={byCode}
          draft={draft}
          onChange={setSubjectState}
          electives={electives}
          onElectivesChange={setElectiveHours}
          initialOpen={[firstOpenLevel]}
          focus={focus}
        />
      ) : (
        <div className="plan-layout">
          <div className="plan-main">
            <PlanMap
              sorted={sorted}
              statusByCode={statusByCode}
              electives={electives}
              selectedCode={selectedCode}
              onSelect={onSelect}
              filter={filter}
            />
            <div className="legend">
              <span><i className="swatch st-aprobada" />Aprobada</span>
              <span><i className="swatch st-regular" />Regular</span>
              <span><i className="swatch st-disponible" />Podés cursar</span>
              <span><i className="swatch st-bloqueada" />Bloqueada</span>
              <span><i className="swatch is-required" />Correlativa de la materia elegida</span>
            </div>
          </div>
          {electiveLevel ? (
            <ElectivesPanel level={electiveLevel} hours={electives[electiveLevel]} onChange={setElectiveHours} />
          ) : (
            <SubjectPanel
              subject={byCode.get(selectedCode)}
              status={statusByCode.get(selectedCode)}
              byCode={byCode}
              value={draft[selectedCode] || 'pendiente'}
              onChange={setSubjectState}
            />
          )}
        </div>
      )}
    </section>
  );
}
