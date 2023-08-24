import React, { useEffect, useState } from 'react';
import Sidebarleft from '../components/sidebars/SidebarLeft';
import SidebarRight from '../components/sidebars/SidebarRight';
import btclogo from '../assets/bitcoin-logo.png';
import VerificationOverlay from '../components/VerificationOverlay';
import './CommonStylesMenus.css';
import verifiedImage from '../assets/verified.png';
import inVerificationImage from '../assets/in-verification.png';
import notVerifiedImage from '../assets/not-verified.png';
import Select from 'react-select';
import { useLoading } from '../components/layout/LoadingContext';

const EnviarRecibir = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const { setIsLoading } = useLoading(); 
  const [activeMenu, setActiveMenu] = useState('enviar');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null); // avatar por defecto
  const token = localStorage.getItem('authToken');
  const isTransferDisabled = !recipient || !amount || !selectedCurrency;

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
        setUserInfo(data);
        const fullAvatarURL = `http://localhost:3001/${data.avatar}`;
        setUserAvatar(fullAvatarURL);
      })
      .catch(error => {
        console.error('Error al obtener la información del usuario:', error);
      });

    // Obtener dirección de la billetera
    fetch('http://localhost:3001/api/wallet/address', {
      headers: {
        'Authorization': token
      },
    })
      .then(res => res.json())
      .then(data => {
        setWalletAddress(data.address);
      })
      .catch(error => {
        console.error('Error al obtener la dirección de la billetera:', error);
      });

  }, [token, setIsLoading]);


  const handleTransfer = () => {
    // Aquí puedes agregar la lógica para procesar la transferencia
    console.log('Transferencia realizada:', recipient, amount);
  };

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


  const currencyOptions = [
    {
      value: 'btc',
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={btclogo} alt="Bitcoin Logo" className="btc-logo" />
          BTC Bitcoin
        </div>
      ),
    },
    // ... otras monedas ...
  ];

    const handleCurrencyChange = (selectedOption) => {
    setSelectedCurrency(selectedOption);
  };
  return (
    <div className="dashboard-container">
      <Sidebarleft />
      <div className="main-content-wrapper">
        <div className="header-dashboard">
          <div className="header-left">
            <img src={userAvatar} alt="Avatar" className="avatar" />
            <h1>Enviar Recibir Bitcoin</h1>
            <img src={verificationImage} alt="Estado de verificación" className="verification-status-image" />
            <span className={verificationClass}>{verificationText}</span>
          </div>
        </div>
        <div className={`main-content ${!isVerified ? 'blur' : ''}`}>
          <div className="menu-dual">
            <button className={activeMenu === 'enviar' ? 'active' : ''} onClick={() => setActiveMenu('enviar')}>Enviar BTC</button>
            <button className={activeMenu === 'recibir' ? 'active' : ''} onClick={() => setActiveMenu('recibir')}>Recibir BTC</button>
          </div>
          {activeMenu === 'enviar' && (
            <div className="send-container">
              <h2>Enviar Bitcoin</h2>
              <div className="select-container">
                <label>Seleccionar Moneda</label>
                <Select
                  options={currencyOptions}
                  isSearchable={false}
                  className="select-box"
                  placeholder="Selecciona moneda"
                  onChange={handleCurrencyChange}
                />
              </div>
              <div className="input-group">
                <label>UserID, Wallet o Correo Electrónico del Destinatario</label>
                <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Introduce el UserID, Wallet o correo electrónico" />
              </div>
              <div className="input-group">
                <label>Monto</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0 BTC" />
              </div>
              <button onClick={handleTransfer} className='transfer-button' disabled={isTransferDisabled}>Transferir</button>
            </div>
          )}
          {activeMenu === 'recibir' && (
            <div className="receive-container">
              <div className="user-info">
                <h2>Recibe criptomonedas directamente de otros usuarios sin comisiones</h2>
                <p><strong>ID de Usuario:</strong> {userInfo?.userId}</p>
                <p><strong>Email:</strong> {userInfo?.email}</p>
                <p><strong>Dirección de Billetera:</strong> {walletAddress}</p>
              </div>
              {/* Aquí puedes agregar el contenido y las funcionalidades específicas de la página "Recibir" */}
            </div>
          )}
        </div>
        {verificationStatus !== null && <VerificationOverlay verificationStatus={verificationStatus} />}
      </div>
      <SidebarRight />
    </div>
  );
};

export default EnviarRecibir;





