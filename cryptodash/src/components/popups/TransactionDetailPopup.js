// TransactionDetailPopup.js
import React from 'react';
import './TransactionDetailPopup.css';

const TransactionDetailPopup = ({ transaction, onClose }) => {
  return (
    <div className="popup-overlay-tdetails">
      <div className="popup-content-tdetails">
        <button onClick={onClose} className="close-popup-tdetails">X</button>
        {/* Aquí puedes agregar más detalles de la transacción si lo deseas */}
        <p>Fecha: {new Date(transaction.date).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + new Date(transaction.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
        <p>Monto: {transaction.amount/100000000}</p>
        <p>Tipo: {transaction.type}</p>
      </div>
    </div>
  );
};

export default TransactionDetailPopup;
