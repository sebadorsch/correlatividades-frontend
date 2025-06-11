import React from 'react';
import { useAuth } from '../contexts/GeneralContext';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoutes = () => {
  const { currentUser } = useAuth();
  return !!currentUser ? <Outlet /> : <Navigate to="login" />;
};

export default PrivateRoutes;
