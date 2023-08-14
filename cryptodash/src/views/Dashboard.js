import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import './CommonStylesMenus.css';
import Sidebar from '../components/Sidebar';
import SettingsContainer from '../components/SettingsContainer';
import avatar from '../assets/avatar.png';
import VerificationOverlay from '../components/VerificationOverlay'; 
import verifiedImage from '../assets/verified.png';
import inVerificationImage from '../assets/in-verification.png';
import notVerifiedImage from '../assets/not-verified.png';
import Loading from '../components/Loading';


const Dashboard = () => {
  const [clientName, setClientName] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null); // Estado para almacenar el estado de verificación
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('authToken');
  console.log(token);


  

  useEffect(() => {
    fetch('http://localhost:3001/api/verificationStatus', {
      headers: {
        'Authorization': token
      },
    })
      .then(res => res.json())
      .then(data => {
        setVerificationStatus(data.status);
        if (data.status === 'en revisión' || data.status === 'verificado') {
          fetch('http://localhost:3001/formData', {
            headers: {
              'Authorization': token
            },
          })
            .then(res => res.json())
            .then(data => {
              if (data && data.personalInformation) {
                setClientName(data.personalInformation.nombres);
              }
              setIsLoading(false); // Establece isLoading en false aquí
            })
            .catch(error => {
              console.error('Hubo un error al obtener los datos:', error);
              setIsLoading(false); // También aquí, en caso de error
            });
        } else {
          setIsLoading(false); // También aquí, si el estado no es 'en revisión' o 'verificado'
        }
      })
      .catch(error => {
        console.error('Hubo un error al obtener el estado de verificación:', error);
        setIsLoading(false); // También aquí, en caso de error
      });
  }, [token]);
  
  if (isLoading) {
    return <Loading />;
  }
  
  
  

  let verificationImage;
  let verificationText;
  let verificationClass;
  switch (verificationStatus) {
    case 'verificado':
      verificationImage = verifiedImage;
      verificationText = 'Cuenta verificada';
      verificationClass = 'verified';
      break;
    case 'en revisión':
      verificationImage = inVerificationImage;
      verificationText = 'Cuenta en revisión';
      verificationClass = 'in-verification';
      break;
    default:
      verificationImage = notVerifiedImage;
      verificationText = 'Sin verificar';
      verificationClass = 'not-verified';
      break;
  }
  const userEmail = localStorage.getItem('userEmail');
  const bitcoinBalance = 0.1234;
  const transactions = [
    { operation: 'Enviado 0.01 BTC', date: '2021-08-01' },
    { operation: 'Recibido 0.05 BTC', date: '2021-07-30' },
  ];
  const isVerified = verificationStatus === 'verificado';

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <div className="header">
          <div className="header-left">
            <img src={avatar} alt="Avatar" className="avatar" />
            <h1>Bienvenido {clientName && verificationStatus !== 'no verificado' ? clientName : ''}</h1>
            <img src={verificationImage} alt="Estado de verificación" className="verification-status-image" />
            <span className={verificationClass}>{verificationText}</span>
          </div>
          <SettingsContainer />
        </div>
        <div className={`main-content ${!isVerified ? 'blur' : ''}`}>
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
        </div>
        <VerificationOverlay verificationStatus={verificationStatus} />
      </div>
    </div>
  );  
};

export default Dashboard;




