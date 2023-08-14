//VerificationPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormData } from '../components/forms/FormDataContext';
import PersonalDataForm from '../components/forms/PersonalDataForm';
import ResidenceForm from '../components/forms/ResidenceForm';
import DocumentForm from '../components/forms/DocumentForm';
import DocumentUploadForm from '../components/forms/DocumentUploadForm';
import DeclarationsForm from '../components/forms/DeclarationsForm';
import ProgressBar from '../components/ProgressBar';
import logo from '../assets/logo.svg'; // Importar el logo
import './VerificationPage.css';

const VerificationPage = () => {
  const { formData } = useFormData();
  const [showPopup, setShowPopup] = useState(false);
  const [step, setStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:3001/api/verificationStatus', {
          headers: {
            'Authorization': token,
          },
        });
        const data = await response.json();
        const verificationStatus = data.status;
        console.log('verificationstatus: ' + verificationStatus);
        if (verificationStatus === 'verificado' || verificationStatus === 'en revisión') {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error al obtener el estado de verificación:', error);
      }
    };

    checkVerificationStatus();
  }, [navigate]);

  const handleNext = () => {
    if (isFormValid) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/dashboard');
      // Código para manejar la cancelación (por ejemplo, cerrar la página)
    }
  };

  const validateForm = (isValid) => {
    console.log("Setting Form Validity:", isValid); 
    setIsFormValid(isValid);
  };

  const getFormTitle = () => {
    switch (step) {
      case 1:
        return 'Datos personales';
      case 2:
        return 'Residencia';
      case 3:
        return 'Documentos de identidad';
      case 4:
        return 'Cargar documentos';
      default:
        return '';
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/saveUserData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        // Llamar a la ruta de verificación después de guardar los datos
        const verifyResponse = await fetch('http://localhost:3001/verify', {
          method: 'POST',
          headers: {
            'Authorization': token,
          },
        });
        const verificationResult = await verifyResponse.json();
  
        // Mostrar un popup diferente según el resultado de la verificación
        if (verificationResult.success) {
          setShowPopup('success');
        } else {
          setShowPopup('failure');
  
          // Eliminar los datos de la base de datos si la verificación falla
          await fetch('http://localhost:3001/api/deleteUserData', {
            method: 'DELETE',
            headers: {
              'Authorization': token,
            },
          });
        }
      } else {
        console.error('Error al guardar los datos');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };
  

  return (
      <div className="verification-page">
        <header className="header-container">
          <img src={logo} alt="Logo" className="header-logo" />
          <a href="/dashboard" className="later-link">hacerlo más tarde</a>
        </header>
        <div className="form-container">
          <div className="image-container">
            <img src={logo} alt="Descripción de la imagen" />
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.</p>
          </div>
          <div className="form-section">
            <div className="form-progress-container">
              <div className="progress-and-text">
                <ProgressBar step={step} />
                <div className="verification-text">
                  <h2 className="verification-title">Verificación de identidad</h2>
                  <p className="verification-subtitle">{getFormTitle()}</p>
                </div>
              </div>
            </div>
            {step === 1 && <PersonalDataForm onNext={handleNext} validateForm={validateForm} />}
            {step === 2 && <ResidenceForm validateForm={validateForm}/>}
            {step === 3 && <DocumentForm validateForm={validateForm}/>}
            {step === 4 && <DocumentUploadForm validateForm={validateForm}/>}
            {step === 5 && <DeclarationsForm validateForm={validateForm}/>}
            <div className="buttons-container">
              <button type="button" className="back-button-verification" onClick={handleBack}>{step > 1 ? 'Atrás' : 'Cancelar'}</button>
              <button type="button" className="next-button-verification" onClick={step === 5 ? handleSubmit : handleNext} disabled={!isFormValid}>{step === 5 ? 'Verificar' : 'Siguiente'}</button>
            </div>
          </div>
        </div>
      {showPopup === 'success' && (
        <div className="popup-verification-success">
          <div className='popup-content'>
            <h2>Verificación exitosa</h2>
            <p>Ya puedes usar todas las funcionalidades</p>
            <button onClick={() => navigate('/dashboard')}>Continuar</button>
          </div>
        </div>
      )}
      {showPopup === 'failure' && (
        <div className="popup-verification-failure">
          <div className='popup-content'>
            <h2>La verificación de identidad ha fallado</h2>
            <p>Revisa los datos, asegúrate que coincidan con las imágenes subidas y procura que en la selfie se vea bien tu rostro</p>
            <button onClick={() => setShowPopup(false)}>Reintentar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;



