import React from 'react';
import AuthForm from '../components/AuthForm';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken'); 
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]); // Agregar 'navigate' aquí


  return (
    <div>
      <AuthForm />
    </div>
  );
};

export default AuthPage;


