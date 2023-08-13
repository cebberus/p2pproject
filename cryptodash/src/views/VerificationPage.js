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
        setShowPopup(true);
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
        {showPopup && (
        <div className="popup-start-verification">
          <div className="popup-content"> {/* Contenedor agregado */}
            <h2>Se iniciará el proceso de verificación</h2>
            <p>Te enviaremos un email cuando el proceso se complete</p>
            <button onClick={() => navigate('/dashboard')}>Continuar</button>
          </div> {/* Fin del contenedor agregado */}
        </div>
      )}
      </div>
  );
};

export default VerificationPage;



