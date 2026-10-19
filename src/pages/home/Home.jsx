import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/PageContainer/PageContainer.js';
import PlanMap from 'src/components/PlanMap/PlanMap.jsx';
import SubjectPanel from 'src/components/SubjectPanel/SubjectPanel.jsx';
import PlanSection from 'src/components/PlanSection/PlanSection.jsx';
import SaveBar from 'src/components/SaveBar/SaveBar.jsx';
import useSubjectDraft from 'src/hooks/useSubjectDraft.js';
import { formatTermType } from 'src/services/planStatus.ts';

const LEVELS = [1, 2, 3, 4, 5];

// Sin sesión: qué hace la app y el plan completo para explorar.
function Welcome({ sorted, byCode }) {
  const navigate = useNavigate();
  const [selectedCode, setSelectedCode] = useState(19);

  return (
    <PageContainer>
      <section className="welcome">
        <div>
          <h1>Sabé qué materias podés cursar</h1>
          <p className="lede">
            Marcá tus materias regulares y aprobadas del Plan 2023 de Ingeniería en Sistemas y te decimos
            a cuáles te podés anotar y qué te falta para el resto.
          </p>
        </div>
        <div className="welcome-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/auth?modo=registro')}>
            Crear mi cuenta
          </button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/auth')}>
            Ya tengo cuenta
          </button>
        </div>
      </section>

      <section className="plan-layout" aria-labelledby="plan-title">
        <div className="plan-main">
          <h2 id="plan-title" className="section-title">El plan completo</h2>
          <p className="muted section-sub">Tocá una materia para ver sus correlativas.</p>
          <PlanMap sorted={sorted} selectedCode={selectedCode} onSelect={setSelectedCode} />
        </div>
        <SubjectPanel subject={byCode.get(selectedCode)} byCode={byCode} />
      </section>
    </PageContainer>
  );
}

export default function Home() {
  const {
    user, sorted, byCode, draft, statusByCode, changes, saveState, setSubjectState, save, discard,
  } = useSubjectDraft();
  const [selectedCode, setSelectedCode] = useState(null);
  const [focus, setFocus] = useState(null);

  if (!user) return <Welcome sorted={sorted} byCode={byCode} />;

  const byState = (state) => sorted.filter((s) => statusByCode.get(s.code)?.state === state);
  const available = byState('disponible');
  const pendingFinals = byState('regular');
  const approvedCount = byState('aprobada').length;
  const hours = available.reduce((sum, s) => sum + (s.weeklyHours || 0), 0);

  // Llevar una materia del resumen al plan de abajo.
  const openInPlan = (code) => {
    setSelectedCode(code);
    setFocus({ code, at: Date.now() });
    // En el celular la checklist lleva a la materia; en escritorio basta con mostrar el mapa.
    if (!window.matchMedia('(max-width: 760px)').matches) {
      document.getElementById('mi-plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const firstAvailable = available[0]?.code ?? sorted[0]?.code;

  return (
    <PageContainer>
      <section className="hello">
        <h1>Tu carrera</h1>
        <p className="lede">
          Llevás {approvedCount} de {sorted.length} materias aprobadas.
        </p>
      </section>

      <div className="home-grid">
        <section className="card" aria-labelledby="disponibles">
          <h2 id="disponibles" className="card-title">Este cuatrimestre podés anotarte en</h2>
          <p className="big-figure">
            <b className="num">{available.length}</b>
            <span>
              {available.length === 1 ? 'materia' : 'materias'}
              {available.length > 0 && `, ${hours} horas por semana si las cursás todas`}
            </span>
          </p>
          {available.length === 0 ? (
            <p className="empty">
              Por ahora ninguna materia cumple las correlativas. Revisá que tus materias estén al día en el plan de abajo.
            </p>
          ) : (
            <ul className="subject-tiles">
              {available.map((s) => (
                <li key={s.code}>
                  <button type="button" className="subject-tile" onClick={() => openInPlan(s.code)}>
                    <strong>{s.name}</strong>
                    <small>{s.courseYear}º nivel · {formatTermType(s.termType)} · {s.weeklyHours ?? '—'} h</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="home-side">
          {pendingFinals.length > 0 && (
            <section className="card" aria-labelledby="finales">
              <h2 id="finales" className="card-title">
                Te {pendingFinals.length === 1 ? 'queda 1 final' : `quedan ${pendingFinals.length} finales`}
              </h2>
              <ul className="plain-list">
                {pendingFinals.map((s) => (
                  <li key={s.code}>
                    <button type="button" className="link-row" onClick={() => openInPlan(s.code)}>
                      <span>{s.name}</span>
                      <small className="muted">{s.courseYear}º nivel</small>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card" aria-labelledby="avance">
            <h2 id="avance" className="card-title">Tu avance por nivel</h2>
            <div className="level-bars">
              {LEVELS.map((level) => {
                const all = sorted.filter((s) => s.courseYear === level);
                const done = all.filter((s) => statusByCode.get(s.code)?.state === 'aprobada').length;
                return (
                  <div className="level-bar" key={level}>
                    <div className="bar" role="img" aria-label={`${level}º nivel: ${done} de ${all.length} aprobadas`}>
                      <i style={{ width: `${(done / all.length) * 100}%` }} />
                    </div>
                    <span className="num">{level}º · {done}/{all.length}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <PlanSection
        sorted={sorted}
        byCode={byCode}
        draft={draft}
        statusByCode={statusByCode}
        setSubjectState={setSubjectState}
        selectedCode={selectedCode ?? firstAvailable}
        onSelect={setSelectedCode}
        focus={focus}
      />

      <SaveBar changes={changes} saveState={saveState} onSave={save} onDiscard={discard} />
    </PageContainer>
  );
}
