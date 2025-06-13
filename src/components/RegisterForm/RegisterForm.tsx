import React, { useState } from 'react';
import { useAuth } from '../../contexts/GeneralContext';
import { useNavigate } from "react-router-dom";
import LoadingAnimation from "../LoadingAnimation";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);

  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(true);

  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePassword = (value: string) => value.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailOk = validateEmail(email);
    const passwordOk = validatePassword(password);
    const passwordsMatch = password === confirmPassword;

    setIsEmailValid(emailOk);
    setIsPasswordValid(passwordOk);
    setDoPasswordsMatch(passwordsMatch);

    if (!emailOk || !passwordOk || !passwordsMatch) return;

    try {
      setLoading(true);
      const successfulSignUp = await signUp({ email, password });

      if (successfulSignUp) navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <LoadingAnimation />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${isEmailValid ? '' : 'is-invalid'}`}
              id="emailInput"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsEmailValid(validateEmail(e.target.value));
              }}
            />
            {!isEmailValid && (
              <div className="invalid-feedback">
                Ingresá un email válido.
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="passwordInput" className="form-label">Contraseña</label>
            <input
              type="password"
              className={`form-control ${isPasswordValid ? '' : 'is-invalid'}`}
              id="passwordInput"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setIsPasswordValid(validatePassword(e.target.value));
                setDoPasswordsMatch(e.target.value === confirmPassword);
              }}
            />
            {!isPasswordValid && (
              <div className="invalid-feedback">
                La contraseña debe tener al menos 6 caracteres.
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPasswordInput" className="form-label">Repetir contraseña</label>
            <input
              type="password"
              className={`form-control ${doPasswordsMatch ? '' : 'is-invalid'}`}
              id="confirmPasswordInput"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setDoPasswordsMatch(password === e.target.value);
              }}
            />
            {!doPasswordsMatch && (
              <div className="invalid-feedback">
                Las contraseñas no coinciden.
              </div>
            )}
          </div>

          <div className="text-end">
            <button
              type="submit"
              className={`btn btn-primary ${(!isEmailValid || !isPasswordValid || !doPasswordsMatch) ? 'disabled' : ''}`}
            >
              Registrarse
            </button>
          </div>
        </form>
      )}
    </>
  );
}
