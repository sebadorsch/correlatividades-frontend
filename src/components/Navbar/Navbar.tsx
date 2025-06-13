import React from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../../contexts/GeneralContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logOut } = useAuth();

  const handleLoginClick = () => {
    if (currentUser) {
      logOut()
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="navbar navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand">Correlatividades Ingeniería en Sistemas - Plan 2023</a>
        <button className="btn btn-warning" type="button" onClick={handleLoginClick}>
          {
            currentUser ? 'Log out' : 'Login'
          }
        </button>
      </div>
    </nav>
  );
}
