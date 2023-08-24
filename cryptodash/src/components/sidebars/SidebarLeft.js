//Sidebar.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import './SidebarLeft.css'; // Importa el archivo CSS
import logo from '../../assets/logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SidebarLeft = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar-left">
      <img src={logo} alt="Logo" className="logo" />
      <nav>
        <a href="/dashboard" className={isActive('/dashboard')}><FontAwesomeIcon className="fa-icon" icon="home" /> Inicio</a>
        <a href="/enviar-recibir" className={isActive('/enviar-recibir')}><FontAwesomeIcon icon="arrow-up" /><FontAwesomeIcon className="fa-icon" icon="arrow-down" /> Enviar/Recibir</a>
        <a href="/depositar-retirar" className={isActive('/depositar-retirar')}><FontAwesomeIcon className="fa-icon" icon="wallet" /> Depositar/Retirar</a>
        <a href="/intercambiar" className={isActive('/intercambiar')}><FontAwesomeIcon className="fa-icon" icon="exchange-alt" /> Intercambiar</a>
      </nav>
    </div>
  );
};

export default SidebarLeft;
