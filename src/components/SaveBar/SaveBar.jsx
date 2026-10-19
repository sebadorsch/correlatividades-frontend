import React from 'react';

export default function SaveBar({ changes, saveState, onSave, onDiscard }) {
  if (changes === 0 && saveState !== 'error' && saveState !== 'saved') return null;

  const text = saveState === 'saving'
    ? 'Guardando…'
    : saveState === 'error'
      ? 'No se pudo guardar. Probá de nuevo.'
      : changes > 0
        ? `${changes} ${changes === 1 ? 'cambio sin guardar' : 'cambios sin guardar'}`
        : 'Listo, guardamos tus materias.';

  return (
    <div className="savebar" role="status">
      <div className="savebar-inner">
        <span className={saveState === 'error' ? 'savebar-error' : ''}>{text}</span>
        {changes > 0 && (
          <div className="savebar-actions">
            <button type="button" className="btn btn-ghost" onClick={onDiscard} disabled={saveState === 'saving'}>
              Descartar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onSave()} disabled={saveState === 'saving'}>
              Guardar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
