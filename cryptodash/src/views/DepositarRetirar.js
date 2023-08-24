import React, { useEffect, useState } from 'react';
import { useLoading } from '../components/layout/LoadingContext';
import Sidebarleft from '../components/sidebars/SidebarLeft';
import SidebarRight from '../components/sidebars/SidebarRight';
import btclogo from '../assets/bitcoin-logo.png';
import VerificationOverlay from '../components/VerificationOverlay';
import './CommonStylesMenus.css';
import verifiedImage from '../assets/verified.png';
import inVerificationImage from '../assets/in-verification.png';
import notVerifiedImage from '../assets/not-verified.png';
import Select from 'react-select';
import QRCode from 'qrcode.react';
import CopyToClipboard from '../components/buttons/CopyToClipboard';


const DepositarRetirar = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const { setIsLoading } = useLoading(); 
  const [activeMenu, setActiveMenu] = useState('depositar');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [amount, setAmount] = useState(null); 
  const [netAmount, setNetAmount] = useState(0); 
  const [isNetAmount, setIsNetAmount] = useState(true); // Estado para rastrear si el usuario quiere recibir el monto neto o el monto total
  const [userBalance, setUserBalance] = useState(0);
  const [inputError, setInputError] = useState('');
  const [userAvatar, setUserAvatar] = useState(null); // avatar por defecto

  const COMMISSION = 0.00005; // Comisión fija para el ejemplo

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    setIsLoading(true);

    const fetchWalletAddress = async () => {
      try {
        const walletAdressResponse = await fetch('http://localhost:3001/api/wallet/address', {
          headers: {
            'Authorization': token
          },
        });
        const walletAdresstData = await walletAdressResponse.json();
        setWalletAddress(walletAdresstData.address);
      } catch (error) {
        console.error('Error fetching wallet address:', error);
      }
    };

    const fetchUserBalance = async () => {
      try {
        const balanceResponse = await fetch('http://localhost:3001/api/wallet/balance', {
          headers: {
            'Authorization': token
          },
        });
        const balanceData = await balanceResponse.json();
        const btcBalance = balanceData.totalBalance / 100000000; // Convertir satoshis a BTC
        setUserBalance(btcBalance);
      } catch (error) {
        console.error('Error fetching user balance:', error);
      }
    };
    const fetchUserInfo = async () => {
      try {
        const userInfoResponse = await fetch('http://localhost:3001/api/getUserInfo', {
          headers: {
            'Authorization': token
          },
        });
        const userInfoData = await userInfoResponse.json();
        const fullAvatarURL = `http://localhost:3001/${userInfoData.avatar}`;
        setUserAvatar(fullAvatarURL);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchWalletAddress();
    fetchUserBalance();
    fetchUserInfo();

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

  const networkOptions = [
    {
      value: 'btc',
      label: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={btclogo} alt="Bitcoin Logo" className="btc-logo" />
          BTC Bitcoin Mainnet
        </div>
      ),
    },
    // ... otras monedas ...
  ];

  const handleCurrencyChange = (selectedOption) => {
    setSelectedCurrency(selectedOption);
  };
  
  const handleNetworkChange = (selectedOption) => {
    setSelectedNetwork(selectedOption);
  };
  
  const handleAmountChange = (e) => {
    const enteredAmount = parseFloat(e.target.value);
  
    // Actualizamos el estado amount siempre
    setAmount(enteredAmount);
  
    if (enteredAmount < 0.0001) {
      setInputError('La cantidad a retirar debe ser al menos 0.00010000');
      setNetAmount(0); // Establecer netAmount a 0 si hay un error
    } else if (enteredAmount > userBalance) {
      setInputError('Por favor ingrese una cantidad no mayor a su saldo disponible');
      setNetAmount(0); // Establecer netAmount a 0 si hay un error
    } else {
      setInputError(''); // Limpiar el error si el monto es válido
      
      let calculatedNetAmount;
      if (isNetAmount) {
        calculatedNetAmount = enteredAmount - COMMISSION;
      } else {
        calculatedNetAmount = enteredAmount;
      }
  
      // Redondeamos a 8 decimales y actualizamos el estado
      setNetAmount(parseFloat(calculatedNetAmount.toFixed(8)));
    }
  };
  
  
  

  const toggleAmountType = () => {
    if (isNetAmount) {
      setAmount(netAmount + COMMISSION);
      setNetAmount(netAmount);
    } else {
      setNetAmount(amount);
      setAmount(amount + COMMISSION);
    }
    setIsNetAmount(!isNetAmount);
  };
  


  
  return (
    <div className="dashboard-container">
      <Sidebarleft />
      <div className="main-content-wrapper">
        <div className="header-dashboard">
          <div className="header-left">
            <img src={userAvatar} alt="Avatar" className="avatar" />
            <h1>Depositar Retirar Bitcoin</h1>
            <img src={verificationImage} alt="Estado de verificación" className="verification-status-image" />
            <span className={verificationClass}>{verificationText}</span>
          </div>
        </div>
        <div className={`main-content ${!isVerified ? 'blur' : ''}`}>
          <div className="menu-dual">
            <button className={activeMenu === 'depositar' ? 'active' : ''} onClick={() => setActiveMenu('depositar')}>Depositar BTC</button>
            <button className={activeMenu === 'retirar' ? 'active' : ''} onClick={() => setActiveMenu('retirar')}>Retirar BTC</button>
          </div>
          {activeMenu === 'depositar' && (
            <div className="deposit-container">
              <h2>Depositar Criptomoneda</h2>
              
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
              
              <div className="select-container">
                <label>Seleccionar Red</label>
                <Select
                  options={networkOptions}
                  isSearchable={false}
                  className="select-box"
                  placeholder="Selecciona red"
                  onChange={handleNetworkChange}
                />
              </div>
              {walletAddress && selectedCurrency?.value === 'btc' && selectedNetwork?.value === 'btc' && (
                <div className="wallet-address-container">
                  <h2>Dirección de depósito</h2>
                  <div className="qr-and-address">
                    <QRCode value={walletAddress} size={150} />
                    <div className="address-and-copy">
                      <span>Dirección</span>
                      <div className="address-with-button">
                        <span className='wallet-address'>{walletAddress}</span>
                        <CopyToClipboard textToCopy={walletAddress}/>
                      </div>
                    </div>
                  </div>
                </div>

              )}
            </div>
          )}

            {activeMenu === 'retirar' && (
              <div className="withdraw-container">
                <h2>Retirar Bitcoin</h2>
                
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
                
                <div className="select-container">
                  <label>Seleccionar Red</label>
                  <Select
                    options={networkOptions}
                    isSearchable={false}
                    className="select-box"
                    placeholder="Selecciona red"
                    onChange={handleNetworkChange}
                  />
                </div>

                <div className="input-group">
                  <label>Dirección de Retiro</label>
                  <input type="text" placeholder="Introduce la dirección de BTC" />
                </div>

                <div className="input-group">
                  <label>Monto</label>
                  <input type="number" value={amount} onChange={handleAmountChange} placeholder="Mínimo 0.0001" className={inputError ? 'input-error' : ''} />
                  {inputError && <div className="error-message">{inputError}</div>}
                  <div className="user-balance">
                    <span>Saldo total: </span>
                    <span>{userBalance} BTC</span>
                  </div>
                  <div className="network-fee">
                    <span>Comisión de la red: </span>
                    <span>{COMMISSION} BTC</span>
                  </div>
                </div>


                


                <div className="toggle-option">
                  <div className="display-amount-group">
                    <label>Cantidad a recibir</label>
                    <div data-bn-type="text" className="recieve-amount" >
                      {netAmount} BTC
                    </div>
                  </div>
                <div className="toggle-button-container" onClick={toggleAmountType} style={{ cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="toggle-icon">
                      <path d="M21 7.5v3H2.5l7-7v4H21zM3 16.5v-3h18.5l-7 7v-4H3z" fill="currentColor"></path>
                    </svg>
                    <div data-bn-type="text" className="toggle-text">Cambiar cantidad de retiro a cantidad recibida</div>
                  </div>
                </div>
                <button className="withdraw-button">Retirar</button>
              </div>
            )}

        </div>
        {verificationStatus !== null && <VerificationOverlay verificationStatus={verificationStatus} />}
      </div>
      <SidebarRight />
    </div>
  );
};

export default DepositarRetirar;


