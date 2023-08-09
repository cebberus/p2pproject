
import React, { useState } from 'react';
import PersonalDataForm from '../components/forms/PersonalDataForm';
import ResidenceForm from '../components/forms/ResidenceForm';
import DocumentForm from '../components/forms/DocumentForm';
import DocumentUploadForm from '../components/forms/DocumentUploadForm';

const VerificationPage = () => {
    const [step, setStep] = useState(1);
  
    const handleNext = () => {
      setStep(step + 1);
    };
  
    return (
      <div className="verification-page">
        {step === 1 && <PersonalDataForm onNext={handleNext} />}
        {step === 2 && <ResidenceForm />}
        {step === 3 && <DocumentForm />}
        {step === 4 && <DocumentUploadForm />}
        {/* Puedes agregar botones para navegar entre los formularios aquí */}
      </div>
    );
  };
  
  export default VerificationPage;
