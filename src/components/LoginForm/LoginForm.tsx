import React, { useState } from 'react';
import { useAuth } from '../../contexts/GeneralContext';
import {useNavigate} from "react-router-dom";
import LoadingAnimation from "../LoadingAnimation";

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
    <>
      {loading ? (
        <LoadingAnimation />
      ) : (
        <>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="emailInput" className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${isEmailValid ? '' : 'is-invalid'}`}
                id="emailInput"
                value={email}
                onChange={handleEmailChange}
              />
              {!isEmailValid && (
                <div className="invalid-feedback">
                  Ingresá un email válido.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="passwordInput" className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${isPasswordValid ? '' : 'is-invalid'}`}
                id="passwordInput"
                value={password}
                onChange={handlePasswordChange}
              />
              {!isPasswordValid && (
                <div className="invalid-feedback">
                  La contraseña debe tener al menos 6 caracteres.
                </div>
              )}
            </div>

            <div className="text-end">
              <button type="submit" className={`btn btn-success ${(!isEmailValid || !isPasswordValid) ? 'disabled' : ''}`}>Submit</button>
            </div>
          </form>
        </>
      )}
    </>
  );
}
