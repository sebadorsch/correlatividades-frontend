import React, { useState } from 'react';
import HoursStepper from 'src/components/HoursStepper/HoursStepper.jsx';
import Icon from 'src/components/Icons/Icon.jsx';

const STATES = [['regular', 'Regular'], ['aprobada', 'Aprobada']];

const StateToggle = ({ name, value, onChange }) => (
  <div className="choice choice-2" role="group" aria-label={`Situación de ${name}`}>
    {STATES.map(([option, label]) => (
      <button key={option} type="button" data-v={option} aria-pressed={value === option} onClick={() => onChange(option)}>
        {label}
      </button>
    ))}
  </div>
);

// Las electivas que cargó el alumno en un nivel, y un formulario para sumar otra.
// actions: { list, add, update, remove }
export default function ElectivesEditor({ level, actions }) {
  const items = actions.list.filter((e) => e.level === level);
  const [name, setName] = useState('');
  const [hours, setHours] = useState(4);
  const [state, setState] = useState('aprobada');
  const nameId = `electiva-nombre-${level}`;

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    actions.add({ name, level, hours, state });
    setName('');
  };

  return (
    <div className="electives-editor">
      {items.length > 0 && (
        <ul className="elective-list">
          {items.map((e) => (
            <li key={e.id} className="elective-row">
              <div className="elective-main">
                <span className="elective-name">{e.name}</span>
                <span className="muted num">{e.hours} h semanales</span>
              </div>
              <StateToggle name={e.name} value={e.state} onChange={(next) => actions.update(e.id, { state: next })} />
              <button type="button" className="icon-btn" aria-label={`Quitar ${e.name}`} onClick={() => actions.remove(e.id)}>
                <Icon name="x" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="elective-form" onSubmit={submit}>
        <h3 className="panel-label">Agregar electiva</h3>
        <label className="visually-hidden" htmlFor={nameId}>Nombre de la electiva</label>
        <input
          id={nameId}
          className="input"
          placeholder="Nombre"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="elective-form-row">
          <HoursStepper
            id={`electiva-horas-${level}`}
            label="Horas semanales de la electiva"
            value={hours}
            onChange={setHours}
          />
          <span className="muted">h semanales</span>
        </div>
        <StateToggle name="la electiva nueva" value={state} onChange={setState} />
        <button type="submit" className="btn btn-ghost" disabled={!name.trim()}>
          <Icon name="plus" />
          Agregar
        </button>
      </form>
    </div>
  );
}
