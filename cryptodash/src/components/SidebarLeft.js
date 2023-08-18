//Sidebar.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import './SidebarLeft.css'; // Importa el archivo CSS
import logo from '../assets/logo.svg';

const SidebarLeft = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar-left">
      <img src={logo} alt="Logo" className="logo" />
      <nav>
        <a href="/dashboard" className={isActive('/dashboard')}>Inicio</a>
        <a href="/enviar-recibir" className={isActive('/enviar-recibir')}>Enviar/Recibir</a>
        <a href="/depositar-retirar" className={isActive('/depositar-retirar')}>Depositar/Retirar</a>
        <a href="/intercambiar" className={isActive('/intercambiar')}>Intercambiar</a>
      </nav>
    </div>
  );
};

export default SidebarLeft;
