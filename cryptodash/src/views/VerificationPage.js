//VerificationPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormDataProvider } from '../components/forms/FormDataContext';
import PersonalDataForm from '../components/forms/PersonalDataForm';
import ResidenceForm from '../components/forms/ResidenceForm';
import DocumentForm from '../components/forms/DocumentForm';
import DocumentUploadForm from '../components/forms/DocumentUploadForm';
import DeclarationsForm from '../components/forms/DeclarationsForm';
import ProgressBar from '../components/ProgressBar';
import logo from '../assets/logo.svg'; // Importar el logo
import './VerificationPage.css';

const VerificationPage = () => {
  const [step, setStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

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

  return (
    <FormDataProvider>
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
              <button type="button"className="next-button-verification" onClick={handleNext} disabled={!isFormValid}>{step === 5 ? 'Finalizar' : 'Siguiente'}</button>
              
            </div>
          </div>
        </div>
      </div>
    </FormDataProvider>
  );
};

export default VerificationPage;



