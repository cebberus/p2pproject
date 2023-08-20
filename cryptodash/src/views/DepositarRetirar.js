import React, { useEffect, useState } from 'react';
import Sidebarleft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import avatar from '../assets/avatar.png';
import btclogo from '../assets/bitcoin-logo.png';
import VerificationOverlay from '../components/VerificationOverlay';
import './CommonStylesMenus.css';
import verifiedImage from '../assets/verified.png';
import inVerificationImage from '../assets/in-verification.png';
import notVerifiedImage from '../assets/not-verified.png';
import Loading from '../components/Loading';
import Select from 'react-select';
import QRCode from 'qrcode.react';


const DepositarRetirar = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('depositar');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [amount, setAmount] = useState(0); // Estado para el monto ingresado
  const [netAmount, setNetAmount] = useState(0); // Estado para la cantidad neta a recibir
  const [isNetAmount, setIsNetAmount] = useState(true); // Estado para rastrear si el usuario quiere recibir el monto neto o el monto total
  const [userBalance, setUserBalance] = useState(0);
  const [inputError, setInputError] = useState('');

  const COMMISSION = 0.00005; // Comisión fija para el ejemplo

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        const walletAdressResponse = await fetch('http://localhost:3001/api/wallet/adress', {
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

    fetchWalletAddress();

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
  }, [token]);

  useEffect(() => {
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
  
    fetchUserBalance();
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
            <img src={avatar} alt="Avatar" className="avatar" />
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
                        <button onClick={() => navigator.clipboard.writeText(walletAddress)}>Copiar</button>
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
                  <input type="number" value={amount} onChange={handleAmountChange} placeholder="0.0 BTC" className={inputError ? 'input-error' : ''} />
                  {inputError && <div className="error-message">{inputError}</div>}
                </div>

                <div className="user-balance">
                  <span>Saldo total: </span>
                  <span>{userBalance} BTC</span>
                </div>
                
                <div className="network-fee">
                  <span>Comisión de la red: </span>
                  <span>{COMMISSION} BTC</span>
                </div>

                <div className="input-group">
                  <label>Cantidad a recibir</label>
                  <input type="number" value={netAmount} placeholder="0.0 BTC" readOnly />
                </div>

                <div className="toggle-option">
                  <button onClick={toggleAmountType}>
                    Cambiar cantidad de retiro a cantidad recibida
                  </button>
                </div>
              </div>
            )}

        </div>
        <VerificationOverlay verificationStatus={verificationStatus} />
      </div>
      <SidebarRight />
    </div>
  );
};

export default DepositarRetirar;


