import React from 'react';
import './Dashboard.css';
import Sidebar from '../components/Sidebar';
import SettingsContainer from '../components/SettingsContainer';
import avatar from '../assets/avatar.png'; // Asegúrate de importar tu avatar

const Dashboard = () => {
  const userEmail = localStorage.getItem('userEmail');
  const bitcoinBalance = 0.1234; // Aquí puedes obtener el saldo real del usuario
  const transactions = [
    { operation: 'Enviado 0.01 BTC', date: '2021-08-01' },
    { operation: 'Recibido 0.05 BTC', date: '2021-07-30' },
    // ... más transacciones ...
  ];

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <div className="header-left">
            <img src={avatar} alt="Avatar" className="avatar" />
            <h1>Bienvenido</h1>
          </div>
          <SettingsContainer />
        </div>
        <div className="balance-container">
          <h2>Saldo Bitcoin</h2>
          <div className="balance">
            <span className="bitcoin-symbol">₿</span>
            {bitcoinBalance}
          </div>
        </div>
        <div className="transactions-container">
          <h2>Registro de Transacciones</h2>
          <table>
            <thead>
              <tr>
                <th>Operaciones</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.operation}</td>
                  <td>{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Aquí puedes agregar más contenido personalizado y funcionalidades */}
      </div>
    </div>
  );
};

export default Dashboard;

