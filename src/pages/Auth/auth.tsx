import React, { useEffect, useState } from 'react';
import LoginForm from "../../components/LoginForm/LoginForm";
import RegisterForm from "../../components/RegisterForm/RegisterForm";
import { useAuth } from "../../contexts/GeneralContext";
import { useNavigate } from "react-router-dom";
import PageContainer from "../../components/PageContainer/PageContainer";
import LoadingAnimation from "../../components/LoadingAnimation";

export default function AuthPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isRegister, setIsRegister] = useState(false); // <-- Nuevo estado

  useEffect(() => {
    if (currentUser) navigate('/');
    setLoading(false);
  }, [currentUser, navigate]);

  return (
    <PageContainer>
      {loading ? (
        <LoadingAnimation />
      ) : (
        <div className="container mt-4">
          <div className='row justify-content-center align-items-center'>
            <div className='col-8'>
              <h1 className="mb-4">{isRegister ? 'Registrarse' : 'Log in'}</h1>

              {isRegister ? <RegisterForm /> : <LoginForm />}

              <div className="mt-3">
                {isRegister ? (
                  <span>
                ¿Ya tenés cuenta?{' '}
                    <button className="btn btn-link p-0" onClick={() => setIsRegister(false)}>
                  Iniciá sesión
                </button>
              </span>
                ) : (
                  <span>
                ¿No tenés cuenta?{' '}
                    <button className="btn btn-link p-0" onClick={() => setIsRegister(true)}>
                  Registrate
                </button>
              </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
