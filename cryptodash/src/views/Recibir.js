import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import SettingsContainer from '../components/SettingsContainer';
import avatar from '../assets/avatar.png';
import VerificationOverlay from '../components/VerificationOverlay';
import './CommonStylesMenus.css';
import verifiedImage from '../assets/verified.png';
import inVerificationImage from '../assets/in-verification.png';
import notVerifiedImage from '../assets/not-verified.png';
import Loading from '../components/Loading';

const Recibir = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetch('http://localhost:3001/api/verificationStatus', {
      headers: {
        'Authorization': token
      },
    })
      .then(res => res.json())
      .then(data => {
        setVerificationStatus(data.status);
        setIsLoading(false); // Establece isLoading en false aquí
      })
      .catch(error => {
        console.error('Hubo un error al obtener el estado de verificación:', error);
        setIsLoading(false); // También aquí, en caso de error
      });
  }, [token]);
  if (isLoading) {
    return <Loading />;
  }

  const isVerified = verificationStatus === 'verificado';

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

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <div className="header">
          <div className="header-left">
            <img src={avatar} alt="Avatar" className="avatar" />
            <h1>Recibir Bitcoin</h1>
            <img src={verificationImage} alt="Estado de verificación" className="verification-status-image" />
            <span className={verificationClass}>{verificationText}</span>
          </div>
          <SettingsContainer />
        </div>
        <div className={`main-content ${!isVerified ? 'blur' : ''}`}>
          <div className="receive-container">
          <h2>RECIEVE</h2>
            {/* Aquí puedes agregar el contenido y las funcionalidades específicas de la página "Recibir" */}
          </div>
        </div>
        <VerificationOverlay verificationStatus={verificationStatus} />
      </div>
    </div>
  );
};

export default Recibir;

