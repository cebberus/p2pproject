import React, { useEffect, useState } from 'react';
import Sidebarleft from '../components/sidebars/SidebarLeft';
import SidebarRight from '../components/sidebars/SidebarRight';
import avatar from '../assets/avatar.png';
import VerificationOverlay from '../components/VerificationOverlay';
import './CommonStylesMenus.css';
import verifiedImage from '../assets/verified.png';
import inVerificationImage from '../assets/in-verification.png';
import notVerifiedImage from '../assets/not-verified.png';
import { useLoading } from '../components/layout/LoadingContext';

const Intercambiar = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const { setIsLoading } = useLoading(); 
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    setIsLoading(true);

    // Obtener estado de verificación
    fetch('http://localhost:3001/api/verificationStatus', {
      headers: {
        'Authorization': token
      },
    })
      .then(res => res.json())
      .then(data => {
        setVerificationStatus(data.status);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Hubo un error al obtener el estado de verificación:', error);
        setIsLoading(false);
      });

    // Obtener información del usuario
    fetch('http://localhost:3001/api/getUserInfo', {
      headers: {
        'Authorization': token
      },
    })
      .then(res => res.json())
      .then(data => {
        const fullAvatarURL = `http://localhost:3001/${data.avatar}`;
        setUserAvatar(fullAvatarURL);
      })
      .catch(error => {
        console.error('Error al obtener la información del usuario:', error);
      });

  }, [token, setIsLoading]);

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
      <Sidebarleft />
      <div className="main-content-wrapper">
        <div className="header-dashboard">
          <div className="header-left">
            <img src={userAvatar || avatar} alt="Avatar" className="avatar" />
            <h1>Intercambiar Bitcoin</h1>
            <img src={verificationImage} alt="Estado de verificación" className="verification-status-image" />
            <span className={verificationClass}>{verificationText}</span>
          </div>
        </div>
        <div className={`main-content ${!isVerified ? 'blur' : ''}`}>
          <div className="to-exchange-container">
            <h2>TO EXCHANGE</h2>
            {/* Aquí puedes agregar el contenido y las funcionalidades específicas de la página "Intercambiar" */}
          </div>
        </div>
        {verificationStatus !== null && <VerificationOverlay verificationStatus={verificationStatus} />}
      </div>
      <SidebarRight />
    </div>
  );
};

export default Intercambiar;


