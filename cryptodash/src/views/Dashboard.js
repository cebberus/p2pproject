import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import './CommonStylesMenus.css';
import Sidebarleft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import avatar from '../assets/avatar.png';
import VerificationOverlay from '../components/VerificationOverlay'; 
import verifiedImage from '../assets/verified.png';
import inVerificationImage from '../assets/in-verification.png';
import notVerifiedImage from '../assets/not-verified.png';
import Loading from '../components/Loading';

const Dashboard = () => {
  const [clientName, setClientName] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [bitcoinBalance, setBitcoinBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const verificationResponse = await fetch('http://localhost:3001/api/verificationStatus', {
          headers: {
            'Authorization': token
          },
        });
        const verificationData = await verificationResponse.json();
        setVerificationStatus(verificationData.status);
  
        if (verificationData.status === 'en revisión' || verificationData.status === 'verificado') {
          const formDataResponse = await fetch('http://localhost:3001/formData', {
            headers: {
              'Authorization': token
            },
          });
          const formData = await formDataResponse.json();
          if (formData && formData.personalInformation) {
            setClientName(formData.personalInformation.nombres);
          }
        }
  
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
  }, [token]);
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

  const isVerified = verificationStatus === 'verificado';

  return (
    <div className="dashboard-container">
      <Sidebarleft />
      <div className="main-content-wrapper">
        <div className="header-dashboard">
          <div className="header-left">
            <img src={avatar} alt="Avatar" className="avatar" />
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
            </>
          )}
        </div>
        {showWalletPopup && (
          <div className="wallet-popup">
            <p>Se ha creado tu billetera exitosamente!</p>
            <button onClick={() => setShowWalletPopup(false)}>Continuar</button>
          </div>
        )}
        <VerificationOverlay verificationStatus={verificationStatus} />
      </div>
      <SidebarRight />
    </div>
  );  
};

export default Dashboard;






