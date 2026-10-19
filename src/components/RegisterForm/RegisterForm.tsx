import React, { useState } from 'react';
import { useAuth } from '../../contexts/GeneralContext';
import { useNavigate } from "react-router-dom";
import PasswordInput from "../PasswordInput/PasswordInput";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');

  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);

  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');

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
      setErrorMessage('');
      const { success, message } = await signUp({ email, password, ...(firstName.trim() && { firstName: firstName.trim() }) });

      if (success) navigate('/');
      else setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errorMessage && <p className="notice-error" role="alert">{errorMessage}. Puede que ese email ya tenga una cuenta.</p>}

      <div className="field">
        <label htmlFor="firstNameInput">Nombre <span className="optional">(opcional)</span></label>
        <input
          type="text"
          className="input"
          id="firstNameInput"
          value={firstName}
          autoComplete="given-name"
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="emailInput">Email</label>
        <input
          type="email"
          className={`input ${isEmailValid ? '' : 'is-invalid'}`}
          id="emailInput"
          value={email}
          autoComplete="email"
          aria-invalid={!isEmailValid}
          onChange={(e) => {
            setEmail(e.target.value);
            setIsEmailValid(validateEmail(e.target.value));
          }}
        />
        {!isEmailValid && <p className="field-error">Ingresá un email válido.</p>}
      </div>

      <div className="field">
        <label htmlFor="passwordInput">Contraseña</label>
        <PasswordInput
          id="passwordInput"
          value={password}
          autoComplete="new-password"
          onChange={(e) => {
            setPassword(e.target.value);
            setIsPasswordValid(validatePassword(e.target.value));
            setDoPasswordsMatch(e.target.value === confirmPassword);
          }}
          isValid={isPasswordValid}
          invalidMessage="La contraseña debe tener al menos 6 caracteres."
        />
      </div>

      <div className="field">
        <label htmlFor="confirmPasswordInput">Repetir contraseña</label>
        <PasswordInput
          id="confirmPasswordInput"
          value={confirmPassword}
          autoComplete="new-password"
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setDoPasswordsMatch(password === e.target.value);
          }}
          isValid={doPasswordsMatch}
          invalidMessage="Las contraseñas no coinciden."
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading || !isEmailValid || !isPasswordValid || !doPasswordsMatch}
        >
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </div>
    </form>
  );
}
