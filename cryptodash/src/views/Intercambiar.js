import React from 'react';
import Sidebar from '../components/Sidebar';
import SettingsContainer from '../components/SettingsContainer';
import avatar from '../assets/avatar.png'; // Asegúrate de importar tu avatar

const Intercambiar = () => {
    return (
        <div className="dashboard-container">
          <Sidebar />
          <div className="main-content">
            <div className="header">
              <div className="header-left">
                <img src={avatar} alt="Avatar" className="avatar" />
                <h1>Intercambiar Bitcoin</h1>
              </div>
              <SettingsContainer />
            </div>
            <div className="send-container">
              {/* Aquí puedes agregar el contenido y las funcionalidades específicas de la página "Enviar" */}
            </div>
          </div>
        </div>
      );
    };

export default Intercambiar;