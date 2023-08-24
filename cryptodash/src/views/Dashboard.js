import React, { useEffect, useState} from 'react';
import './Dashboard.css';
import './CommonStylesMenus.css';
import Sidebarleft from '../components/sidebars/SidebarLeft';
import SidebarRight from '../components/sidebars/SidebarRight';
import btclogo from '../assets/bitcoin-logo.png';
import VerificationOverlay from '../components/VerificationOverlay'; 
import verifiedImage from '../assets/verified.png';
import inVerificationImage from '../assets/in-verification.png';
import notVerifiedImage from '../assets/not-verified.png';
import { useLoading } from '../components/layout/LoadingContext';
import TransactionDetailPopup from '../components/popups/TransactionDetailPopup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Dashboard = () => {
  const [clientName, setClientName] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [hasWallet, setHasWallet] = useState(null);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [bitcoinBalance, setBitcoinBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const { setIsLoading } = useLoading();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null); // avatar por defecto

  const token = localStorage.getItem('authToken');
  
  const translateTransactionType = (type) => {
    switch (type) {
      case 'deposit':
        return 'Depósito';
      case 'withdrawal':
        return 'Retiro';
      case 'send':
        return 'Envío';
      case 'receive':
        return 'Recibo';
      default:
        return type; // En caso de que se reciba un tipo no esperado, se muestra tal cual
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const verificationResponse = await fetch('http://localhost:3001/api/verificationStatus', {
          headers: {
            'Authorization': token
          },
        });
        const verificationData = await verificationResponse.json();
        setVerificationStatus(verificationData.status);
        const userInfoResponse = await fetch('http://localhost:3001/api/getUserInfo', {
          headers: {
            'Authorization': token
          },
        });
        const userInfoData = await userInfoResponse.json();
        const fullAvatarURL = `http://localhost:3001/${userInfoData.avatar}`;
        setUserAvatar(fullAvatarURL);
        setClientName(userInfoData.nombreDeUsuario);
  
        // Verificar si el usuario tiene una billetera
        const walletExistResponse = await fetch('http://localhost:3001/api/wallet/exist', {
          headers: {
            'Authorization': token
          },
        });
        const walletExistData = await walletExistResponse.json();
        setHasWallet(walletExistData.exists);
  
        // Obtener el balance de la billetera
        const balanceResponse = await fetch('http://localhost:3001/api/wallet/balance', {
          headers: {
            'Authorization': token
          },
        });
        const balanceData = await balanceResponse.json();
        setBitcoinBalance(balanceData.totalBalance);
  
        // Obtener las transacciones de la billetera
        const transactionsResponse = await fetch('http://localhost:3001/api/wallet/transactions', {
          headers: {
            'Authorization': token
          },
        });
        const transactionsData = await transactionsResponse.json();
        if (transactionsData && transactionsData.transactions) {
          setTransactions(transactionsData.transactions);
        } else {
          console.error('Unexpected API response format:', transactionsData);
        }
  
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [token,setIsLoading]);
  console.log(token);
  

  const createWallet = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/createwallet', {
        method: 'POST',
        headers: {
          'Authorization': token
        },
      });
      const data = await response.json();
      if (data.message === 'Billetera creada con éxito') {
        setHasWallet(true);
        setShowWalletPopup(true);
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };


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

  const isVerified = verificationStatus === 'verificado';

  const formatBitcoinBalance = (satoshis) => {
    // Convertir satoshis a bitcoins
    const bitcoins = satoshis / 100000000;
    // Separar la parte entera y decimal
    const [integerPart, decimalPart] = parseFloat(bitcoins).toFixed(8).split('.');
    // Formatear la parte entera con comas
    const formattedInteger = parseInt(integerPart).toLocaleString();
    // Unir la parte entera y decimal con una coma
    return `${formattedInteger},${decimalPart} BTC`;
  };
// Función para convertir satoshis a BTC de forma limpia
  const formatBitcoinBalanceClean = (satoshis) => {
    // Convertir satoshis a bitcoins
    const bitcoins = satoshis / 100000000;

    // Reemplazar el punto por una coma
    return String(bitcoins).replace('.', ',');
  };


  return (
    <div className="dashboard-container">
      <Sidebarleft />
      <div className="main-content-wrapper">
        <div className="header-dashboard">
          <div className="header-left">
          <img src={userAvatar} alt="Avatar" className="avatar" />
            <h1>Bienvenido {clientName && verificationStatus !== 'no verificado' ? clientName : ''}</h1>
            <img src={verificationImage} alt="Estado de verificación" className="verification-status-image" />
            <span className={verificationClass}>{verificationText}</span>
          </div>
        </div>
        <div className={`main-content ${!isVerified ? 'blur' : ''}`}>
          {!hasWallet ? (
            <div className="wallet-container">
              <p>Aun no haz creado tu billetera de Bitcoin</p>
              <button onClick={createWallet}>Crear wallet</button>
            </div>
          ) : (
            <>
              <div className="balance-container">
                <h2>Saldo Estimado</h2>
                <div className="balance">
                <img src={btclogo} alt="btclogo" className="btclogo" />
                {formatBitcoinBalance(bitcoinBalance)}
                </div>
              </div>
              <div className="transactions-container">
                <h2>Registro de Transacciones</h2>
                {transactions.map((transaction, index) => (
                  <div className="transaction-item" key={index}>
                    <div className={`transaction-arrow ${['deposit', 'receive'].includes(transaction.type) ? 'green-arrow' : 'red-arrow'}`}>
                      {['deposit', 'receive'].includes(transaction.type) ? 
                        <FontAwesomeIcon icon="arrow-down"  /> : 
                        <FontAwesomeIcon icon="arrow-up"  />
                      }
                    </div>
                    <div className="transaction-details">
                      {/* Modificación en la forma de mostrar la fecha para incluir hora y minutos */}
                      <span>{new Date(transaction.date).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + new Date(transaction.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{formatBitcoinBalanceClean(transaction.amount)}</span>
                      {/* Uso de la función para traducir el tipo de transacción al español */}
                      <span>{translateTransactionType(transaction.type)}</span>
                    </div>
                    <button className="transaction-detail-button" onClick={() => setSelectedTransaction(transaction)}>Ver Detalle</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {showWalletPopup && (
          <div className="wallet-popup">
            <p>Se ha creado tu billetera exitosamente!</p>
            <button onClick={() => setShowWalletPopup(false)}>Continuar</button>
          </div>
        )}
        {selectedTransaction && (
          <TransactionDetailPopup
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
         {verificationStatus !== null && <VerificationOverlay verificationStatus={verificationStatus} />}
      </div>
      <SidebarRight />
    </div>
  );  
};

export default Dashboard;






