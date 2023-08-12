import React from 'react';
import Sidebar from '../components/Sidebar';
import SettingsContainer from '../components/SettingsContainer';
import avatar from '../assets/avatar.png';
import VerificationOverlay, { isUserVerified } from '../components/VerificationOverlay';
import './CommonStylesMenus.css';

const Recibir = () => {
  const isVerified = isUserVerified();
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <div className="header">
          <div className="header-left">
            <img src={avatar} alt="Avatar" className="avatar" />
            <h1>Recibir Bitcoin</h1>
          </div>
          <SettingsContainer />
        </div>
        <div className={`main-content ${!isVerified ? 'blur' : ''}`}>
          <div className="receive-container">
          <h2>RECIEVE</h2>
            {/* Aquí puedes agregar el contenido y las funcionalidades específicas de la página "Recibir" */}
          </div>
        </div>
        <VerificationOverlay />
      </div>
    </div>
  );
};

export default Recibir;

