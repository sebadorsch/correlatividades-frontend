import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Home from "src/pages/home/Home.jsx";
import {AuthProvider} from "src/contexts/GeneralContext.tsx";
import './index.css';
import AuthPage from "src/pages/Auth/auth.js";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<Navigate to="/" replace />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </ AuthProvider>
  );
}

export default App;
