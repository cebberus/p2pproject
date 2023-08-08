import React, { useState } from 'react';
import './SettingsContainer.css'; // Importa el archivo CSS
import settingsIcon from '../assets/settings-icon.png'; // Icono de ajustes
import logoutIcon from '../assets/logout-icon.png'; // Icono de cerrar sesión

const SettingsContainer = () => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
  };

  const handleLogoutConfirm = () => {
    // Realizar una solicitud POST a la ruta de cierre de sesión
    fetch('http://localhost:3001/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('authToken'),
      },
    })
      .then((res) => {
        if (res.status === 403) {
          throw new Error('No autorizado para cerrar sesión');
        }
        return res.json();
      })
      .then((data) => {
        localStorage.removeItem('authToken'); // Elimina el token del almacenamiento local
        setShowLogoutPopup(false);
        window.location.href = '/auth';
      })
      .catch((error) => {
        console.error('Error al cerrar la sesión:', error);
      });
    
  };
  

  return (
    <div className="settings-container">
      <div className="options">
        <a href="/ajustes">
          <img src={settingsIcon} alt="Ajustes" className="icon" />
          Ajustes
        </a>
        <a onClick={handleLogoutClick}>
          <img src={logoutIcon} alt="Cerrar Sesión" className="icon" />
          Cerrar Sesión
        </a>
      </div>
      {showLogoutPopup && (
        <div className="logout-popup">
          <div className="logout-container">
            <p>¿Estás seguro de cerrar sesión?</p>
            <button onClick={() => setShowLogoutPopup(false)}>Cancelar</button>
            <button onClick={handleLogoutConfirm}>Salir</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsContainer;