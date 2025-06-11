import React from 'react';
import { useAuth } from '../contexts/GeneralContext';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoutes = () => {
  // const { currentUser } = useAuth();
  // return !currentUser ? <Outlet /> : <Navigate to="/" />;
};

export default PublicRoutes;
