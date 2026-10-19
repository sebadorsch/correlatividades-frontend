import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/PageContainer/PageContainer.js';
import PlanMap from 'src/components/PlanMap/PlanMap.jsx';
import SubjectPanel from 'src/components/SubjectPanel/SubjectPanel.jsx';
import PlanSection from 'src/components/PlanSection/PlanSection.jsx';
import SaveBar from 'src/components/SaveBar/SaveBar.jsx';
import useSubjectDraft from 'src/hooks/useSubjectDraft.js';
import { useAuth } from 'src/contexts/GeneralContext.js';
import ElectivesPanel from 'src/components/ElectivesPanel/ElectivesPanel.jsx';
import {
  analistaProgress, degreeSubjects, formatTermType, ingenieriaProgress,
} from 'src/services/planStatus.ts';

const LEVELS = [1, 2, 3, 4, 5];

// El plan no llegó desde la API: decirlo y ofrecer reintentar, en vez de un mapa vacío.
function PlanUnavailable() {
  const { getSubjects, subjectsError } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const retry = async () => {
    setRetrying(true);
    await getSubjects();
    setRetrying(false);
  };

  return (
    <PageContainer>
      <section className="card plan-unavailable" role="alert">
        <h1 className="card-title">{subjectsError ? 'No pudimos cargar el plan de estudio' : 'Cargando el plan de estudio…'}</h1>
        {subjectsError && (
          <>
            <p className="muted">Puede ser un problema de conexión o del servidor. Probá de nuevo en unos segundos.</p>
            <button type="button" className="btn btn-primary" onClick={retry} disabled={retrying}>
              {retrying ? 'Reintentando…' : 'Reintentar'}
            </button>
          </>
        )}
      </section>
    </PageContainer>
  );
}

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
        {typeof selectedCode === 'string'
          ? <ElectivesPanel level={Number(selectedCode.slice(1))} />
          : <SubjectPanel subject={byCode.get(selectedCode)} byCode={byCode} />}
      </section>
    </PageContainer>
  );
}

export default function Home() {
  const {
    user, sorted, byCode, draft, electives, statusByCode, changes, saveState,
    setSubjectState, setElectiveHours, save, discard,
  } = useSubjectDraft();
  const [selectedCode, setSelectedCode] = useState(null);
  const [focus, setFocus] = useState(null);

  if (sorted.length === 0) return <PlanUnavailable />;
  if (!user) return <Welcome sorted={sorted} byCode={byCode} />;

  const byState = (state) => sorted.filter((s) => statusByCode.get(s.code)?.state === state);
  const available = byState('disponible');
  const pendingFinals = byState('regular');
  const degree = degreeSubjects(sorted);
  const approvedCount = degree.filter((s) => statusByCode.get(s.code)?.state === 'aprobada').length;
  const titles = [
    {
      key: 'analista',
      name: 'Analista Desarrollador Universitario',
      electivesLabel: 'Electivas de 3º nivel',
      progress: analistaProgress(sorted, statusByCode, electives),
    },
    {
      key: 'ingenieria',
      name: 'Ingeniería en Sistemas de Información',
      electivesLabel: 'Electivas de 3º a 5º nivel',
      progress: ingenieriaProgress(sorted, statusByCode, electives),
      note: 'Además pide 200 h de Práctica Profesional Supervisada.',
    },
  ];
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
          Llevás {approvedCount} de {degree.length} materias aprobadas.
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
                const all = degree.filter((s) => s.courseYear === level);
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

          <section className="card" aria-labelledby="titulos">
            <h2 id="titulos" className="card-title">Tus títulos</h2>
            <ul className="titles">
              {titles.map(({ key, name, electivesLabel, progress, note }) => (
                <li key={key}>
                  <div className="title-line">
                    <strong>{name}</strong>
                    {progress.complete && <span className="tag tag-disponible">Completo</span>}
                  </div>
                  <div className="bar" role="img" aria-label={`${progress.approved} de ${progress.total} materias aprobadas`}>
                    <i style={{ width: `${(progress.approved / progress.total) * 100}%` }} />
                  </div>
                  <span className="muted num">
                    {progress.approved} de {progress.total} materias · {electivesLabel}: {progress.electivesDone} de {progress.electivesRequired} h
                  </span>
                  {note && <small className="muted">{note}</small>}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <PlanSection
        sorted={sorted}
        byCode={byCode}
        draft={draft}
        statusByCode={statusByCode}
        setSubjectState={setSubjectState}
        electives={electives}
        setElectiveHours={setElectiveHours}
        selectedCode={selectedCode ?? firstAvailable}
        onSelect={setSelectedCode}
        focus={focus}
      />

      <SaveBar changes={changes} saveState={saveState} onSave={save} onDiscard={discard} />
    </PageContainer>
  );
}
