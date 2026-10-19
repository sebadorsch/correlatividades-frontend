import React, { useState } from 'react';
import { useAuth } from '../../contexts/GeneralContext';
import { useNavigate } from "react-router-dom";
import PasswordInput from "../PasswordInput/PasswordInput";

export default function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);

  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const { logIn } = useAuth();

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePassword = (value: string) => value.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailOk = validateEmail(email);
    const passwordOk = validatePassword(password);

    setIsEmailValid(emailOk);
    setIsPasswordValid(passwordOk);

    if (!emailOk || !passwordOk) return;

    try {
      setLoading(true);
      setErrorMessage('');
      const { success, message } = await logIn(email, password);
      if (success) {
        navigate('/');
      } else {
        setErrorMessage(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(validateEmail(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setIsPasswordValid(validatePassword(value));
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errorMessage && <p className="notice-error" role="alert">{errorMessage}. Revisá el email y la contraseña.</p>}

      <div className="field">
        <label htmlFor="emailInput">Email</label>
        <input
          type="email"
          className={`input ${isEmailValid ? '' : 'is-invalid'}`}
          id="emailInput"
          value={email}
          onChange={handleEmailChange}
          autoComplete="email"
          aria-invalid={!isEmailValid}
        />
        {!isEmailValid && <p className="field-error">Ingresá un email válido.</p>}
      </div>

      <div className="field">
        <label htmlFor="passwordInput">Contraseña</label>
        <PasswordInput
          id="passwordInput"
          value={password}
          onChange={handlePasswordChange}
          isValid={isPasswordValid}
          invalidMessage="La contraseña debe tener al menos 6 caracteres."
          autoComplete="current-password"
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading || !isEmailValid || !isPasswordValid}
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </div>
    </form>
  );
}
