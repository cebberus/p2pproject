// VerificationOverlay.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VerificationOverlay.css';

export const getVerificationStatus = () => localStorage.getItem('verificationStatus');
const VerificationOverlay = () => {
  const navigate = useNavigate();
  const verificationStatus = getVerificationStatus();

  const handleVerificationClick = () => {
    navigate('/verificationpage');
  };

  if (verificationStatus === 'en revisión') {
    return (
      <div className="verification-overlay">
        <div className="verification-message">
          <h3>Su cuenta se encuentra en proceso de verificación</h3>
          <p>Pronto podrás usar todas las funcionalidades</p>
        </div>
      </div>
    );
  }

  if (verificationStatus !== 'verificado') { // Cambio aquí
    return (
      <div className="verification-overlay">
        <div className="verification-message">
          <h3>Gracias por tu registro !</h3>
          <p>Verifica tu cuenta para acceder a todas las funcionalidades</p>
          <button onClick={handleVerificationClick}>Verificar cuenta</button>
        </div>
      </div>
    );
  }

  return null;
};

export default VerificationOverlay;

