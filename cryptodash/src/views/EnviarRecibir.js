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
  const [userBalance, setUserBalance] = useState(0);
  const [inputError, setInputError] = useState('');

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

  }, [token, setIsLoading]);


  const handleTransfer = async () => {
    // Verificar si el usuario ha ingresado un destinatario y un monto
    if (!recipient || !amount) {
      alert('Por favor, ingrese un destinatario y un monto.');
      return;
    }
  
    // Convertir el monto a satoshis (si estás utilizando BTC como unidad principal)
    const satoshisAmount = parseFloat(amount) * 100000000;
  
    try {
      const response = await fetch('http://localhost:3001/api/wallet/send-receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          senderAddress: walletAddress, // Asumiendo que tienes la dirección de la billetera del remitente en una variable llamada walletAddress
          recipientIdentifier: recipient,
          amount: satoshisAmount
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Transacción completada con éxito');
        // Aquí puedes agregar cualquier otra lógica que desees ejecutar después de una transacción exitosa, como actualizar el saldo del usuario.
      } else {
        alert(data.error || 'Error al realizar la transacción');
      }
    } catch (error) {
      console.error('Error al enviar Bitcoin:', error);
      alert('Hubo un error al realizar la transacción. Por favor, inténtalo de nuevo.');
    }
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

  const handleMaxClick = () => {
    if (userBalance === 0) {
      return; // Si el saldo es 0, simplemente regresa sin hacer nada
    } else{
      setAmount(userBalance);
    }
  }


  const handleAmountChange = (e) => {
    const enteredValue = e.target.value;
  
    // Verifica si el valor ingresado contiene solo números, puntos o comas
    if (!/^[\d.,]+$/.test(enteredValue) && enteredValue !== "") {
      return; // Si no es válido, simplemente regresa sin hacer nada
    }
  
    // Si el input está vacío, resetea los valores y sale de la función
    if (enteredValue === "") {
      setAmount('');
      setInputError(''); // Limpiar el error
      return;
    }
    setAmount(enteredValue);
  
    // Convierte comas a puntos para el cálculo
    const enteredAmount = parseFloat(enteredValue.replace(',', '.'));
  
    // Si no es un número válido, regresa
    if (isNaN(enteredAmount)) {
      return;
    }
  
    // Actualizamos el estado amount siempre
    if (enteredAmount > userBalance) {
      setInputError('Por favor ingrese una cantidad no mayor a su saldo disponible');
    } else {
      setInputError(''); // Limpiar el error si el monto es válido
      
    }
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
                <label>Nombre de usuario, Wallet o Correo Electrónico del Destinatario</label>
                <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Introduce el Nombre de usuario, Wallet o Correo electrónico" />
              </div>
              <div className="input-group">
                <label>Monto</label>
                <div className="input-wrapper">
                  <input type="text" value={amount} onChange={handleAmountChange} placeholder="Mínimo 0.0001" />
                  <div className="withdraw-amount-max-container">
                    <div data-bn-type="text" className="amount-max" onClick={handleMaxClick}>MÁX</div>
                    <div className="separator-withdraw-amount-max"></div>
                    <div data-bn-type="text" className="btc-max">BTC</div>
                  </div>
                </div>
                {inputError && <div className="error-message">{inputError}</div>}
                <div className="user-balance">
                  <span>Saldo total: </span>
                  <span>{userBalance} BTC</span>
                </div>
              </div>
              <button onClick={handleTransfer} className='transfer-button' disabled={isTransferDisabled}>Transferir</button>
            </div>
          )}
          {activeMenu === 'recibir' && (
            <div className="receive-container">
              <div className="user-info">
                <h2>Recibe criptomonedas directamente de otros usuarios sin comisiones</h2>
                <p><strong>Nombre de usuario:</strong> {userInfo?.nombreDeUsuario}</p>
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





