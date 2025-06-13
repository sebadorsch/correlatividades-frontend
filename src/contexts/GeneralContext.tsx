import React, { useContext, useEffect, useState } from 'react';
import {logIn as backendSignIn} from '../services/authService';
import { signUp as backendSignUp } from '../services/authService';
import axiosInstance, { decodeToken, isTokenExpired } from '../config/axiosConfig';
import {getSubjectsFromApi} from "../services/subjects";
import {getMe} from "../services/getMe";

interface GeneralContextType {
  currentUser: any | null;
  setCurrentUser: any,
  logIn: (email: string, password: string) => Promise<{success: boolean, message: string}>;
  signUp: (body :{email: string, password: string}) => Promise<{success: boolean, message: string}>;
  logOut: () => void;
  getSubjects: () => Promise<any>;
  subjects: any;
}

const GeneralContext = React.createContext<GeneralContextType | null>(null);

export const useAuth = () => useContext(GeneralContext) as GeneralContextType;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const logIn = async (email: string, password: string) => {
    try {
      const data = await backendSignIn('email', password);

      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      const decodedUser = decodeToken(data.accessToken);
      setCurrentUser(decodedUser);
      
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      return { success: true, message: '' };
    } catch (error: any) {
      console.error('[GeneralContext] Sign in failed:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  };

  const signUp = async (body :{email: string, password: string}) => {
    try {
      const data = await backendSignUp(body);

      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      const decodedUser = decodeToken(data.accessToken);
      setCurrentUser(decodedUser);

      axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      return { success: true, message: '' };
    } catch (error: any) {
      console.error('[GeneralContext] Sign in failed:', error);
      return { success: false, message: 'Error al registrarse' };
    }
  };

  const logOut = () => {
    setCurrentUser(null);
    localStorage.clear();
    delete axiosInstance.defaults.headers.common.Authorization;
    window.location.href = '/';
  };

  const [subjects, setSubjects] = useState(null);
  const getSubjects = async() => {
    try {
      const data = await getSubjectsFromApi();
      setSubjects(data);
    } catch (e){
      console.log(e)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    const initialize = async () => {
      if (token && !isTokenExpired(token)) {
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
        try {
          const userFromBackend = await getMe(); // 👈 usar getMe() en vez de decodeToken
          setCurrentUser(userFromBackend);
        } catch (error) {
          console.error('[GeneralContext] Error fetching user from backend:', error);
          logOut(); // Si falla getMe, forzar logout
        }
      }

      await getSubjects();
      setLoading(false);
    };

    initialize().then();
  }, []);

  return (
    <GeneralContext.Provider value={{ currentUser, setCurrentUser, logIn, signUp, logOut, getSubjects, subjects }}>
      {!loading && children}
    </GeneralContext.Provider>
  );
};
