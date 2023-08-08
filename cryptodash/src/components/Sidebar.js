import React from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar">
      <img src={logo} alt="Logo" className="logo" />
      <nav>
        <a href="/dashboard" className={isActive('/dashboard')}>Inicio</a>
        <a href="/enviar" className={isActive('/enviar')}>Enviar</a>
        <a href="/recibir" className={isActive('/recibir')}>Recibir</a>
        <a href="/intercambiar" className={isActive('/intercambiar')}>Intercambiar</a>
      </nav>
    </div>
  );
};

export default Sidebar;
