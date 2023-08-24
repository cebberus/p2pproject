import React, { useEffect, useState } from 'react';
import Sidebarleft from '../components/sidebars/SidebarLeft';
import SidebarRight from '../components/sidebars/SidebarRight';
import VerificationOverlay from '../components/VerificationOverlay';
import './CommonStylesMenus.css';
import './Perfil.css'
import verifiedImage from '../assets/verified.png';
import inVerificationImage from '../assets/in-verification.png';
import notVerifiedImage from '../assets/not-verified.png';
import { useLoading } from '../components/layout/LoadingContext';
import EditUsernamePopup from '../components/popups/EditUsernamePopup';
import EditAvatarPopup from '../components/popups/EditAvatarPopup';


const Perfil = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const { setIsLoading } = useLoading(); 
  const [nombreDeUsuario, setNombreDeUsuario] = useState('');
  const [avatar, setAvatar] = useState(); // Usamos el avatar por defecto
  const [isUsernamePopupOpen, setIsUsernamePopupOpen] = useState(false);
  const [isAvatarPopupOpen, setIsAvatarPopupOpen] = useState(false);
  const token = localStorage.getItem('authToken');



  const handleSaveUsername = async (updatedUsername) => {
    try {
      const response = await fetch('http://localhost:3001/api/updateProfileUsername', {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombreDeUsuario: updatedUsername
        })
      });

      const data = await response.json();
      if (data.message === 'Perfil actualizado con éxito') {
        setNombreDeUsuario(updatedUsername);
        setIsUsernamePopupOpen(false);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error al actualizar el nombre de usuario:', error);
    }
  };

  const handleSaveAvatar = async (avatarUrl) => {
    try {
        const response = await fetch('http://localhost:3001/api/updateProfileAvatar', {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ avatar: avatarUrl })
        });

        const data = await response.json();
        if (data.message === 'Perfil actualizado con éxito') {
            // Asegurarse de que la URL del avatar es absoluta
            const fullAvatarURL = avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:3001/${avatarUrl}`;
            setAvatar(fullAvatarURL);
            setIsAvatarPopupOpen(false);
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error al actualizar el avatar:', error);
    }
};



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
        setAvatar(fullAvatarURL);
        setNombreDeUsuario(data.nombreDeUsuario);
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
            <img src={avatar} alt="Avatar" className="avatar" />
            <h1>Mi Perfil</h1>
            <img src={verificationImage} alt="Estado de verificación" className="verification-status-image" />
            <span className={verificationClass}>{verificationText}</span>
          </div>
        </div>
        <div className={`main-content ${!isVerified ? 'blur' : ''}`}>
            <div className="profile-container">
            <h2>Perfil</h2>
            <div className="profile-row">
                <span>Nombre de usuario:</span>
                <span>{nombreDeUsuario}</span>
                <button className='edit-profile-button' onClick={() => setIsUsernamePopupOpen(true)}>Editar</button>
            </div>
            <div className="profile-row">
                <span>Avatar:</span>
                <img src={avatar} alt="Avatar del usuario" className="small-avatar" />
                <button className='edit-profile-button' onClick={() => setIsAvatarPopupOpen(true)}>Cambiar</button>
            </div>
          </div>
        </div>
        {verificationStatus !== null && <VerificationOverlay verificationStatus={verificationStatus} />}
      </div>
      <SidebarRight />
      <EditUsernamePopup 
        key={nombreDeUsuario}
        isOpen={isUsernamePopupOpen} 
        onClose={() => setIsUsernamePopupOpen(false)} 
        currentUsername={nombreDeUsuario} 
        onSave={(updatedUsername) => handleSaveUsername(updatedUsername)}
        />
      <EditAvatarPopup 
        isOpen={isAvatarPopupOpen} 
        onClose={() => setIsAvatarPopupOpen(false)} 
        currentAvatar={avatar} 
        onSave={(newAvatarUrl) => handleSaveAvatar(newAvatarUrl)}
        token={token}
      />
    </div>
    );

};

export default Perfil;