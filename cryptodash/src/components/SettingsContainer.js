import React from 'react';
import avatar from '../assets/avatar.png'; // Importa tu avatar
import settingsIcon from '../assets/settings-icon.png'; // Icono de ajustes
import logoutIcon from '../assets/logout-icon.png'; // Icono de cerrar sesión

const SettingsContainer = () => {
  return (
    <div className="settings-container">
      <div className="options">
        <a href="/ajustes">
          <img src={settingsIcon} alt="Ajustes" className="icon" />
          Ajustes
        </a>
        <a href="/cerrar-sesion">
          <img src={logoutIcon} alt="Cerrar Sesión" className="icon" />
          Cerrar Sesión
        </a>
      </div>
    </div>
  );
};

export default SettingsContainer;
