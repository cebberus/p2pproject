// VerificationOverlay.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VerificationOverlay.css';

export const isUserVerified = () => localStorage.getItem('isVerified') === 'true';
const VerificationOverlay = () => {
  const navigate = useNavigate();
  const isVerified = isUserVerified();

  const handleVerificationClick = () => {
    navigate('/verificationpage');
  };

  if (!isVerified) {
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

