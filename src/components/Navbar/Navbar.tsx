import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/GeneralContext";

// Marca: la grilla del plan en miniatura. Cinco columnas (niveles); lo aprobado en tinta,
// la próxima materia que podés cursar en verde, el resto por delante.
const CELLS: [number, number, string][] = [
  [0, 0, 'mark-ink'], [0, 1, 'mark-ink'], [0, 2, 'mark-ink'],
  [1, 0, 'mark-ink'], [1, 1, 'mark-ink'], [1, 2, 'mark-accent'],
  [2, 0, 'mark-soft'], [2, 1, 'mark-soft'], [2, 2, 'mark-soft'],
  [3, 0, 'mark-soft'], [3, 1, 'mark-soft'],
  [4, 0, 'mark-soft'], [4, 1, 'mark-soft'],
];

const PlanMark = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    {CELLS.map(([col, row, cls]) => (
      <rect key={`${col}-${row}`} x={1 + col * 4.6} y={3 + row * 6.6} width="3.6" height="5.4" rx="1" className={cls} />
    ))}
  </svg>
);

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser, logOut } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" to="/">
          <PlanMark />
          <span className="brand-name">Correlatividades</span>
          <span className="brand-scope">Ing. en Sistemas · Plan 2023</span>
        </Link>

        <div className="topbar-end">
          {currentUser ? (
            <>
              <span className="avatar" aria-hidden="true">
                {(currentUser.firstName || currentUser.email || '?').charAt(0).toUpperCase()}
              </span>
              <button className="btn-text" type="button" onClick={logOut}>Salir</button>
            </>
          ) : pathname !== '/auth' && (
            <button className="btn-text" type="button" onClick={() => navigate('/auth')}>Ingresar</button>
          )}
        </div>
      </div>
    </header>
  );
}
