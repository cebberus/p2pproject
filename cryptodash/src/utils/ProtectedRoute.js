import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const checkTokenValidity = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/checkTokenValidity', {
          headers: {
            'Authorization': token
          },
        });

        if (response.status === 403) {
          localStorage.removeItem('authToken');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error checking token validity:', error);
      }
    };

    checkTokenValidity();
  }, [token]);

  if (!token) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;

