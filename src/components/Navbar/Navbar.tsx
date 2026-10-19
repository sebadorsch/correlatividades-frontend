import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/GeneralContext";

// Marca: cinco columnas de distinta altura, los cinco niveles del plan.
const PlanMark = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
    <rect x="1" y="12" width="3" height="9" rx="1" fill="#141414" />
    <rect x="5.5" y="9" width="3" height="12" rx="1" fill="#141414" />
    <rect x="10" y="6" width="3" height="15" rx="1" fill="#141414" />
    <rect x="14.5" y="3.5" width="3" height="17.5" rx="1" fill="#141414" />
    <rect x="19" y="1" width="2.5" height="20" rx="1" fill="#1d5fbf" />
  </svg>
);

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser, logOut } = useAuth();

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <PlanMark />
        <span className="brand-name">Correlatividades</span>
        <span className="brand-scope">Ingeniería en Sistemas · Plan 2023 · UTN San Nicolás</span>
      </Link>
      <div className="topbar-end">
        {currentUser ? (
          <>
            <span className="topbar-user">{currentUser.email}</span>
            <button className="btn-text" type="button" onClick={logOut}>Cerrar sesión</button>
          </>
        ) : pathname !== '/auth' && (
          <button className="btn btn-secondary" type="button" onClick={() => navigate('/auth')}>Ingresar</button>
        )}
      </div>
    </header>
  );
}
