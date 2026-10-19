import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "../../components/LoginForm/LoginForm";
import RegisterForm from "../../components/RegisterForm/RegisterForm";
import { useAuth } from "../../contexts/GeneralContext";
import PageContainer from "../../components/PageContainer/PageContainer";

const LEVELS = [1, 2, 3, 4, 5];

export default function AuthPage() {
  const { currentUser, subjects } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('modo') === 'registro');

  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser, navigate]);

  const sorted = [...(subjects || [])].sort((a: any, b: any) => a.code - b.code);

  return (
    <PageContainer>
      <div className="grid auth-grid">
        <section className="panel span-5 auth-panel" aria-labelledby="auth-title">
          <div className="tabs" role="tablist" aria-label="Elegí cómo entrar">
            <button type="button" role="tab" aria-selected={!isRegister} onClick={() => setIsRegister(false)}>
              Ingresar
            </button>
            <button type="button" role="tab" aria-selected={isRegister} onClick={() => setIsRegister(true)}>
              Crear cuenta
            </button>
          </div>

          <div className="title-row" style={{ marginBottom: 20 }}>
            <div>
              <h1 id="auth-title">{isRegister ? 'Creá tu cuenta' : 'Ingresá a tu plan'}</h1>
              <p className="subline">
                {isRegister
                  ? 'Con tu cuenta guardás tus materias regulares y aprobadas.'
                  : 'Mirá qué materias podés cursar según tus correlativas.'}
              </p>
            </div>
          </div>

          {isRegister ? <RegisterForm /> : <LoginForm />}

          <p className="switch-line">
            {isRegister ? '¿Ya tenés cuenta? ' : '¿Todavía no tenés cuenta? '}
            <button className="btn-text" type="button" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Ingresá' : 'Creá una'}
            </button>
          </p>
        </section>

        <section className="panel span-7" aria-labelledby="plan-preview">
          <div className="panel-head">
            <h2 id="plan-preview">Plan 2023 de un vistazo</h2>
            <span className="panel-note num">{sorted.length} materias · 5 niveles</span>
          </div>
          <div className="plan-preview">
            {LEVELS.map((level) => (
              <div key={level}>
                <h3>{level}º nivel</h3>
                <ol>
                  {sorted.filter((s: any) => s.courseYear === level).map((s: any) => (
                    <li key={s.code}><span className="code">{s.code}</span>{s.name}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
