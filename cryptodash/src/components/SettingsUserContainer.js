import React, { useEffect,useState } from 'react';
import './SettingsUserContainer.css'; // Importa el archivo CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 

const SettingsUserContainer = () => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [avatarURL, setAvatarURL] = useState(null);
  const [username, setUsername] = useState('null');


  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfoResponse = await fetch('http://localhost:3001/api/getUserInfo', {
          headers: {
            'Authorization': token
          },
        });
        const userInfoData = await userInfoResponse.json();
        if (userInfoData && userInfoData.avatar) {
          const fullAvatarURL = `http://localhost:3001/${userInfoData.avatar}`;
          setAvatarURL(fullAvatarURL);
        }
        if (userInfoData.nombreDeUsuario) {
          setUsername(userInfoData.nombreDeUsuario);
        }
      } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
      }
    };
  
    fetchUserInfo();
  }, [token]);

  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
  };

  const handleLogoutConfirm = () => {
    // Realizar una solicitud POST a la ruta de cierre de sesión
    fetch('http://localhost:3001/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('authToken'),
      },
    })
      .then((res) => {
        if (res.status === 403) {
          throw new Error('No autorizado para cerrar sesión');
        }
        return res.json();
      })
      .then((data) => {
        localStorage.removeItem('authToken'); // Elimina el token del almacenamiento local
        setShowLogoutPopup(false);
        window.location.href = '/auth';
      })
      .catch((error) => {
        console.error('Error al cerrar la sesión:', error);
      });
  };

  return (
    <div className="settings-user-container">
      <div className="settings-user-avatar" onMouseEnter={() => setIsDropdownVisible(true)} onMouseLeave={() => setIsDropdownVisible(false)}>
      <img src={avatarURL} alt="User Avatar" />
      <span className="username">{username}</span>
        {isDropdownVisible && (
          <div className="settings-user-dropdown-menu">
            <a href="/perfil"><FontAwesomeIcon className="fa-icon" icon="user" /> Perfil</a>
            <a href="/ajustes" ><FontAwesomeIcon className="fa-icon" icon="cog" /> Ajustes</a>
            <a onClick={handleLogoutClick}><FontAwesomeIcon className="fa-icon" icon="sign-out-alt" />Cerrar Sesión</a>
          </div>
        )}
      </div>
      {showLogoutPopup && (
        <div className="logout-popup">
          <div className="logout-container">
            <p>¿Estás seguro de cerrar sesión?</p>
            <button onClick={() => setShowLogoutPopup(false)}>Cancelar</button>
            <button onClick={handleLogoutConfirm}>Salir</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsUserContainer;
