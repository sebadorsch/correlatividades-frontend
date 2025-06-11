import React, { useContext, useEffect, useState } from 'react';
import { logIn as backendSignIn } from '../services/authService';
import axiosInstance, { decodeToken, isTokenExpired } from '../config/axiosConfig';
import {getSubjectsFromApi} from "../services/subjects";

interface GeneralContextType {
  currentUser: any | null;
  logIn: (email: string, password: string) => Promise<boolean>;
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
      const data = await backendSignIn(email, password);

      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      const decodedUser = decodeToken(data.accessToken);
      setCurrentUser(decodedUser);
      
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      return true;
    } catch (error) {
      console.error('[GeneralContext] Sign in failed:', error);
      return false;
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
    
    if (token) {
      if (!isTokenExpired(token)) {
        const decodedUser = decodeToken(token);
        setCurrentUser(decodedUser);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
    }

    getSubjects().then();
    setLoading(false);
  }, []);

  return (
    <GeneralContext.Provider value={{ currentUser, logIn, logOut, getSubjects, subjects }}>
      {!loading && children}
    </GeneralContext.Provider>
  );
};
