import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/auth" />; // Redirige a la página de inicio de sesión si no hay token
  }

  return children; // Renderiza la ruta protegida si hay token
};

export default ProtectedRoute;
