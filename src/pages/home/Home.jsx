import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/PageContainer/PageContainer.js';
import { useAuth } from 'src/contexts/GeneralContext.js';
import { postUsersSubjects } from "src/services/submitUsersSubjects.js";
import { buildStatus, findTopUnlock, formatTermType, levelName } from "src/services/planStatus.ts";

const LEVELS = [1, 2, 3, 4, 5];

const STATE_LABEL = {
  aprobada: 'Aprobada',
  regular: 'Regular',
  disponible: 'Podés cursar',
  bloqueada: 'Bloqueada',
};

// Estado que marca el alumno: 'pendiente' | 'regular' | 'aprobada'
const draftFromUser = (user) => {
  const draft = {};
  (user?.regularizedSubjects || []).forEach((code) => { draft[code] = 'regular'; });
  (user?.approvedSubjects || []).forEach((code) => { draft[code] = 'aprobada'; });
  return draft;
};

const listFromDraft = (draft) => {
  const entries = Object.entries(draft);
  return {
    regularizedSubjects: entries.filter(([, s]) => s === 'regular' || s === 'aprobada').map(([c]) => Number(c)).sort((a, b) => a - b),
    approvedSubjects: entries.filter(([, s]) => s === 'aprobada').map(([c]) => Number(c)).sort((a, b) => a - b),
  };
};

const joinNames = (subjects) => {
  const names = subjects.map((s) => s.name);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
};

const Codes = ({ codes, byCode }) => (
  codes.length === 0
    ? <span className="none">—</span>
    : codes.map((code, i) => (
      <React.Fragment key={code}>
        {i > 0 && ', '}
        <span title={byCode.get(code)?.name}>{code}</span>
      </React.Fragment>
    ))
);

const StatusText = ({ status }) => {
  if (status.state !== 'bloqueada') {
    return <span className={`status status-${status.state}`}>{STATE_LABEL[status.state]}</span>;
  }
  const parts = [];
  if (status.missingRegular.length) parts.push(`regularizar ${status.missingRegular.join(', ')}`);
  if (status.missingApproved.length) parts.push(`aprobar ${status.missingApproved.join(', ')}`);
  return <span className="status status-bloqueada">Te falta {parts.join(' y ')}</span>;
};

const StateControl = ({ code, name, value, onChange }) => (
  <fieldset className="segmented" onClick={(e) => e.stopPropagation()}>
    <legend className="visually-hidden">Tu situación en {name}</legend>
    {[['pendiente', 'Pendiente'], ['regular', 'Regular'], ['aprobada', 'Aprobada']].map(([option, label]) => (
      <label key={option}>
        <input
          type="radio"
          name={`state-${code}`}
          value={option}
          checked={value === option}
          onChange={() => onChange(code, option)}
        />
        {label}
      </label>
    ))}
  </fieldset>
);

export default function Home() {
  const { subjects, currentUser: user, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [draft, setDraft] = useState(() => draftFromUser(user));
  const [selectedCode, setSelectedCode] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  useEffect(() => { setDraft(draftFromUser(user)); }, [user]);

  const sorted = useMemo(
    () => [...(subjects || [])].sort((a, b) => a.code - b.code),
    [subjects],
  );
  const byCode = useMemo(() => new Map(sorted.map((s) => [s.code, s])), [sorted]);

  const { regularizedSubjects, approvedSubjects } = listFromDraft(draft);
  const statusByCode = useMemo(
    () => buildStatus(sorted, regularizedSubjects, approvedSubjects),
    [sorted, regularizedSubjects.join(), approvedSubjects.join()],
  );
  const topUnlock = useMemo(
    () => (user ? findTopUnlock(sorted, regularizedSubjects, approvedSubjects) : null),
    [user, sorted, regularizedSubjects.join(), approvedSubjects.join()],
  );

  const savedDraft = draftFromUser(user);
  const changes = user
    ? sorted.filter((s) => (draft[s.code] || 'pendiente') !== (savedDraft[s.code] || 'pendiente')).length
    : 0;

  const count = (state) => sorted.filter((s) => statusByCode.get(s.code)?.state === state).length;
  const available = sorted.filter((s) => statusByCode.get(s.code)?.state === 'disponible');
  const approvedCount = count('aprobada');
  const regularCount = count('regular');
  const blockedCount = count('bloqueada');

  const selected = selectedCode ? byCode.get(selectedCode) : null;
  const requiredRegular = new Set(selected?.requiredSubjectsToEnroll || []);
  const requiredApproved = new Set(selected?.requiredSubjectsToPass || []);

  const handleStateChange = (code, value) => {
    setDraft((prev) => ({ ...prev, [code]: value }));
    setSaveState('idle');
  };

  const selectSubject = (code, scroll = false) => {
    setSelectedCode((prev) => (prev === code && !scroll ? null : code));
    if (scroll) {
      document.getElementById(`materia-${code}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSave = async () => {
    setSaveState('saving');
    try {
      const data = await postUsersSubjects({ regularizedSubjects, approvedSubjects });
      setCurrentUser({
        ...user,
        regularizedSubjects: data?.regularizedSubjects ?? regularizedSubjects,
        approvedSubjects: data?.approvedSubjects ?? approvedSubjects,
      });
      setSaveState('saved');
    } catch (error) {
      console.error('Ocurrió un error al guardar las materias', error);
      setSaveState('error');
    }
  };

  const stamp = saveState === 'saving'
    ? 'Guardando…'
    : saveState === 'error'
      ? 'No se pudo guardar. Probá de nuevo.'
      : changes > 0
        ? `${changes} ${changes === 1 ? 'cambio sin guardar' : 'cambios sin guardar'}`
        : saveState === 'saved' ? 'Guardado' : 'Todo guardado';

  if (!subjects) {
    return (
      <PageContainer>
        <div className="title-row"><div><h1>Plan de estudio</h1><p className="subline">Cargando las materias…</p></div></div>
        <section className="panel">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ margin: '15px 0', width: `${60 + (i % 3) * 12}%` }} />
          ))}
        </section>
      </PageContainer>
    );
  }

  const totalHoursAvailable = available.reduce((sum, s) => sum + (s.weeklyHours || 0), 0);

  // Bloqueadas a las que les falta una sola correlativa
  const nearlyAvailable = sorted.filter((s) => {
    const status = statusByCode.get(s.code);
    return status?.state === 'bloqueada' && status.missingRegular.length + status.missingApproved.length === 1;
  });
  const NEAR_LIMIT = 3;

  const needText = (s) => {
    const status = statusByCode.get(s.code);
    const [code] = [...status.missingRegular, ...status.missingApproved];
    const verb = status.missingRegular.length ? 'regularizar' : 'aprobar';
    return `Falta ${verb} ${byCode.get(code)?.name ?? code}`;
  };

  return (
    <PageContainer>
      <div className="title-row">
        <div>
          <h1>{user ? 'Tu plan de estudio' : 'Plan de estudio'}</h1>
          {user ? (
            <p className="subline">
              {available.length === 0
                ? 'Hoy no tenés materias habilitadas para cursar.'
                : `Podés cursar ${available.length} ${available.length === 1 ? 'materia' : 'materias'}.`}
              {topUnlock && (
                <> Si aprobás <strong>{topUnlock.subject.name}</strong>, se te {topUnlock.unlocks.length === 1 ? 'habilita' : 'habilitan'} {topUnlock.unlocks.length} más: {joinNames(topUnlock.unlocks)}.</>
              )}
            </p>
          ) : (
            <p className="subline">
              {sorted.length} materias en 5 niveles. Ingresá para marcar tus materias y ver cuáles podés cursar.
            </p>
          )}
        </div>
        <div className="title-actions">
          {user ? (
            <>
              <span className={`stamp ${saveState === 'error' ? 'is-error' : ''}`} role="status">{stamp}</span>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSave}
                disabled={changes === 0 || saveState === 'saving'}
              >
                Guardar cambios
              </button>
            </>
          ) : (
            <button className="btn btn-primary" type="button" onClick={() => navigate('/auth')}>
              Ingresar
            </button>
          )}
        </div>
      </div>

      {user && (
        <div className="grid">
          <section className="panel span-8" aria-labelledby="disponibles">
            <div className="panel-head">
              <h2 id="disponibles">Podés cursar ahora</h2>
              <span className="panel-note num">{totalHoursAvailable} h semanales en total</span>
            </div>
            <div className="lead">
              <span className="lead-value">{available.length}</span>
              <span className="lead-label">de {sorted.length - approvedCount - regularCount} materias que te quedan por cursar</span>
            </div>
            {available.length === 0 ? (
              <p className="empty">Ninguna materia cumple las correlativas todavía. Marcá tus regulares y aprobadas en el plan.</p>
            ) : (
              <ul className="rows">
                {available.map((s) => (
                  <li key={s.code}>
                    <button className="row-button" type="button" onClick={() => selectSubject(s.code, true)}>
                      <span className="code">{s.code}</span>
                      <span className="name">{s.name}</span>
                      <span className="muted">{levelName(s.courseYear)}</span>
                      <span className="muted col-term">{formatTermType(s.termType)}</span>
                      <span className="right num col-hours">{s.weeklyHours ?? '—'} h</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {nearlyAvailable.length > 0 && (
              <>
                <h3 className="subhead">
                  A una correlativa de distancia
                  <span className="num">{Math.min(nearlyAvailable.length, NEAR_LIMIT)} de {nearlyAvailable.length}</span>
                </h3>
                <ul className="rows">
                  {nearlyAvailable.slice(0, NEAR_LIMIT).map((s) => (
                    <li key={s.code}>
                      <button className="row-button near" type="button" onClick={() => selectSubject(s.code, true)}>
                        <span className="code">{s.code}</span>
                        <span className="name">{s.name}</span>
                        <span className="need">{needText(s)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="panel span-4" aria-labelledby="avance">
            <div className="panel-head">
              <h2 id="avance">Tu avance</h2>
            </div>
            <p className="progress-figure">{approvedCount} <span>de {sorted.length} aprobadas</span></p>
            <div className="track" role="img" aria-label={`${approvedCount} de ${sorted.length} materias aprobadas`}>
              <div className="track-fill" style={{ width: `${(approvedCount / sorted.length) * 100}%` }} />
            </div>
            <div className="track-ends num"><span>0</span><span>{sorted.length}</span></div>
            <dl className="kv">
              <div><dt>Regulares, sin final</dt><dd>{regularCount}</dd></div>
              <div><dt>Bloqueadas por correlativas</dt><dd>{blockedCount}</dd></div>
            </dl>

            <div className="map" aria-label="Mapa de la carrera">
              {LEVELS.map((level) => (
                <div className="map-level" key={level}>
                  <span className="map-level-name">{level}º</span>
                  {sorted.filter((s) => s.courseYear === level).map((s) => {
                    const state = statusByCode.get(s.code)?.state;
                    return (
                      <button
                        key={s.code}
                        type="button"
                        className={`cell mark-${state} ${selectedCode === s.code ? 'is-selected' : ''}`}
                        title={`${s.code} · ${s.name} · ${STATE_LABEL[state]}`}
                        aria-label={`${s.name}: ${STATE_LABEL[state]}`}
                        onClick={() => selectSubject(s.code, true)}
                      >
                        {s.code}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="legend">
              <span><i className="swatch mark-aprobada" />Aprobada</span>
              <span><i className="swatch mark-regular" />Regular</span>
              <span><i className="swatch mark-disponible" />Podés cursar</span>
              <span><i className="swatch mark-bloqueada" />Bloqueada</span>
            </div>
          </section>
        </div>
      )}

      <section className="panel" aria-labelledby="plan">
        <div className="panel-head">
          <h2 id="plan">Plan de estudio</h2>
          <span className="panel-note">Tocá una materia para ver sus correlativas</span>
        </div>

        <div role="table" aria-label="Materias del plan 2023">
          <div role="row" className={`plan-row plan-head ${user ? '' : 'no-edit'}`}>
            <span role="columnheader">Código</span>
            <span role="columnheader">Materia</span>
            <span role="columnheader" className="col-term">Cursado</span>
            <span role="columnheader" className="right col-hours">h/sem</span>
            <span role="columnheader" className="col-reg">Regular</span>
            <span role="columnheader" className="col-app">Aprobada</span>
            {user && <span role="columnheader">Estado</span>}
            {user && <span role="columnheader">Tu situación</span>}
          </div>

          {LEVELS.map((level) => {
            const levelSubjects = sorted.filter((s) => s.courseYear === level);
            const levelApproved = levelSubjects.filter((s) => statusByCode.get(s.code)?.state === 'aprobada').length;
            return (
              <div role="rowgroup" className="plan-body" key={level}>
                <div className="plan-level">
                  {levelName(level)}
                  <span className="muted num">
                    {user ? `${levelApproved} de ${levelSubjects.length} aprobadas` : `${levelSubjects.length} materias`}
                  </span>
                </div>
                {levelSubjects.map((s) => {
                  const status = statusByCode.get(s.code);
                  const isSelected = selectedCode === s.code;
                  const reqTag = requiredApproved.has(s.code)
                    ? 'Requisito: aprobada'
                    : requiredRegular.has(s.code) ? 'Requisito: regular' : null;
                  return (
                    <React.Fragment key={s.code}>
                      <div
                        role="row"
                        id={`materia-${s.code}`}
                        className={`plan-row ${user ? '' : 'no-edit'} ${isSelected ? 'is-selected' : ''} ${reqTag ? 'is-required' : ''}`}
                        onClick={() => selectSubject(s.code)}
                        aria-selected={isSelected}
                      >
                        <span role="cell" className="code col-code">{s.code}</span>
                        <span role="cell" className="col-name">
                          <span className="name">{s.name}</span>
                          {reqTag && <span className="req-tag">{reqTag}</span>}
                        </span>
                        <span role="cell" className="muted col-term">{formatTermType(s.termType)}</span>
                        <span role="cell" className="right num col-hours">{s.weeklyHours ?? '—'}</span>
                        <span role="cell" className="codes col-reg"><Codes codes={s.requiredSubjectsToEnroll} byCode={byCode} /></span>
                        <span role="cell" className="codes col-app"><Codes codes={s.requiredSubjectsToPass} byCode={byCode} /></span>
                        <span role="cell" className="col-reqs">
                          {formatTermType(s.termType)} · {s.weeklyHours ?? '—'} h · Regular: {s.requiredSubjectsToEnroll.join(', ') || '—'} · Aprobada: {s.requiredSubjectsToPass.join(', ') || '—'}
                        </span>
                        {user && <span role="cell" className="col-status"><StatusText status={status} /></span>}
                        {user && (
                          <span role="cell" className="col-edit">
                            <StateControl
                              code={s.code}
                              name={s.name}
                              value={draft[s.code] || 'pendiente'}
                              onChange={handleStateChange}
                            />
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="detail">
                          <span>
                            <strong>Para cursarla, regular: </strong>
                            {s.requiredSubjectsToEnroll.length === 0 ? 'nada' : s.requiredSubjectsToEnroll.map((code, i) => (
                              <React.Fragment key={code}>
                                {i > 0 && ', '}
                                <span className={user ? (status.missingRegular.includes(code) ? 'missing' : 'ok') : ''}>
                                  {byCode.get(code)?.name ?? code}{user && status.missingRegular.includes(code) && ' (falta)'}
                                </span>
                              </React.Fragment>
                            ))}
                          </span>
                          <span>
                            <strong>Aprobada: </strong>
                            {s.requiredSubjectsToPass.length === 0 ? 'nada' : s.requiredSubjectsToPass.map((code, i) => (
                              <React.Fragment key={code}>
                                {i > 0 && ', '}
                                <span className={user ? (status.missingApproved.includes(code) ? 'missing' : 'ok') : ''}>
                                  {byCode.get(code)?.name ?? code}{user && status.missingApproved.includes(code) && ' (falta)'}
                                </span>
                              </React.Fragment>
                            ))}
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
    </PageContainer>
  );
}
