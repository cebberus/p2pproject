import React from 'react';
import Sidebar from '../components/Sidebar';
import SettingsContainer from '../components/SettingsContainer';
import avatar from '../assets/avatar.png';
import VerificationOverlay, { isUserVerified } from '../components/VerificationOverlay';
import './CommonStylesMenus.css';


const Intercambiar = () => {
  const isVerified = isUserVerified();
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
          <div className="to-exchange-container">
          <h2>TO EXCHANGE</h2>
            {/* Aquí puedes agregar el contenido y las funcionalidades específicas de la página "Intercambiar" */}
          </div>
        </div>
        <VerificationOverlay />
      </div>
    </div>
  );
};

export default Intercambiar;

