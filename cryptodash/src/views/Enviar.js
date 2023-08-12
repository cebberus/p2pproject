import React from 'react';
import Sidebar from '../components/Sidebar';
import SettingsContainer from '../components/SettingsContainer';
import avatar from '../assets/avatar.png';
import VerificationOverlay, { isUserVerified } from '../components/VerificationOverlay';
import './CommonStylesMenus.css';



const Enviar = () => {
  const isVerified = isUserVerified();
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <div className="header">
          <div className="header-left">
            <img src={avatar} alt="Avatar" className="avatar" />
            <h1>Enviar Bitcoin</h1>
          </div>
          <SettingsContainer />
        </div>
        <div className={`main-content ${!isVerified ? 'blur' : ''}`}>
          <div className="send-container">
            <h2>SEND</h2>
            {/* Aquí puedes agregar el contenido y las funcionalidades específicas de la página "Enviar" */}
          </div>
        </div>
        <VerificationOverlay />
      </div>
    </div>
  );
};

export default Enviar;



