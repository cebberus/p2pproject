import React from 'react';
import Sidebar from '../components/Sidebar';
import SettingsContainer from '../components/SettingsContainer';
import avatar from '../assets/avatar.png';

const Intercambiar = () => {
const isVerified = localStorage.getItem('isVerified') === 'true';

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <div className="header">
          <div className="header-left">
            <img src={avatar} alt="Avatar" className="avatar" />
            <h1>Intercambiar Bitcoin</h1>
          </div>
          <SettingsContainer />
        </div>
        <div className={`main-content ${!isVerified ? 'blur' : ''}`}>
          <div className="send-container">
            {/* Aquí puedes agregar el contenido y las funcionalidades específicas de la página "Enviar" */}
          </div>
        </div>
        {!isVerified && (
          <div className="verification-overlay">
            <div className="verification-message">
              <p>Verifica tu cuenta para acceder a todas las funcionalidades</p>
              <button>Verificar cuenta</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Intercambiar;
