// components/popups/SuccessPopup.js
import './SuccessWithdrawPopup.css'
import React from 'react';

const SuccessWithdrawPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Retiro realizado con éxito!</h2>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default SuccessWithdrawPopup;
