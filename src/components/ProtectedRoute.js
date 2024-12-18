// ProtectedRoute.js
//import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (user === undefined) {
    // Authentifizierungsstatus wird noch geladen
    return null; // Oder ein Ladeindikator
  }

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;