//DeclarationsForm.js
import React, { useEffect } from 'react';
import { useFormData } from './FormDataContext';

const DeclarationsForm = ({ validateForm }) => {
  const { formData, setFormData } = useFormData();
  const { isPEP, isPEPYou, declaration1, declaration2, pepDetails } = formData.declarationsData;

  const setIsPEP = (value) => {
    let updatedIsPEPYou = isPEPYou;
    let updatedPepDetails = pepDetails;
    if (value === false) {
      // Si la respuesta es "No", restablece los datos relacionados con la persona PEP
      updatedIsPEPYou = null;
      updatedPepDetails = {
        nombres: '',
        apellidos: '',
        numeroDocumento: '',
        cargo: ''
      };
      // También puedes borrar los datos del localStorage si es necesario
      localStorage.removeItem('declarationsData');
    }
  
    setFormData({
      ...formData,
      declarationsData: {
        ...formData.declarationsData,
        isPEP: value,
        isPEPYou: updatedIsPEPYou,
        pepDetails: updatedPepDetails
      }
    });
  };
  

  const setIsPEPYou = (value) => {
    let updatedPepDetails = pepDetails;
    if (value === true) {
      // Si la respuesta es "Sí", restablece los detalles de la persona PEP
      updatedPepDetails = {
        nombres: '',
        apellidos: '',
        numeroDocumento: '',
        cargo: ''
      };
      // También puedes borrar los datos del localStorage si es necesario
      localStorage.removeItem('declarationsData');
    }
  
    setFormData({
      ...formData,
      declarationsData: {
        ...formData.declarationsData,
        isPEPYou: value,
        pepDetails: updatedPepDetails
      }
    });
  };

  const setDeclaration1 = (value) => {
    setFormData({
      ...formData,
      declarationsData: { ...formData.declarationsData, declaration1: value }
    });
  };

  const setDeclaration2 = (value) => {
    setFormData({
      ...formData,
      declarationsData: { ...formData.declarationsData, declaration2: value }
    });
  };

  const setPepDetails = (name, value) => {
    console.log(`Setting PEP detail: ${name} = ${value}`); // Debug log
    setFormData({
      ...formData,
      declarationsData: {
        ...formData.declarationsData,
        pepDetails: {
          ...pepDetails,
          [name]: value
        }
      }
    });
  };

  useEffect(() => {
    console.log('Saving to localStorage:', formData.declarationsData); // Debug log
    localStorage.setItem('declarationsData', JSON.stringify(formData.declarationsData));
  }, [formData.declarationsData]);

  useEffect(() => {
    const isValid = declaration1 && declaration2 && (
      (isPEP === false) ||
      (isPEP === true && isPEPYou === true) ||
      (isPEP === true && isPEPYou === false && pepDetails.nombres && pepDetails.apellidos && pepDetails.numeroDocumento && pepDetails.cargo)
    );
    validateForm(isValid);
  }, [isPEP, isPEPYou, declaration1, declaration2, pepDetails]);

  return (
    <div className="inner-form-container">
      <h3>¿Eres una Persona Expuesta Políticamente (PEP) o tienes algún vínculo con una? </h3>
      <div className="pep-options">
        <label>
          <input type="radio" name="isPEP" value="no" checked={isPEP === false} onChange={() => setIsPEP(false)} />
          No
        </label>
        <label>
          <input type="radio" name="isPEP" value="yes" checked={isPEP === true} onChange={() => setIsPEP(true)} />
          Sí
        </label>
      </div>
      {isPEP && (
        <>
          <h4>¿La persona PEP eres tú?</h4>
          <div className="pep-you-options">
            <label>
              <input type="radio" name="isPEPYou" value="no" checked={isPEPYou === false} onChange={() => setIsPEPYou(false)} />
              No
            </label>
            <label>
              <input type="radio" name="isPEPYou" value="yes" checked={isPEPYou === true} onChange={() => setIsPEPYou(true)} />
              Sí
            </label>
          </div>
          {isPEPYou === false && (
            <div className="datos-form" style={{ marginTop: "-20px" }}>
                <h5>Carga los siguientes datos de la persona PEP:</h5>
                <input type="text" name="nombres" placeholder="Nombres" value={pepDetails.nombres} onChange={e => setPepDetails('nombres', e.target.value)} maxLength="30" />
                <input type="text" name="apellidos" placeholder="Apellidos" value={pepDetails.apellidos} onChange={e => setPepDetails('apellidos', e.target.value)} maxLength="30" />
                <input type="text" name="numeroDocumento" placeholder="Número de documento" value={pepDetails.numeroDocumento} onChange={e => setPepDetails('numeroDocumento', e.target.value)} maxLength="30" />
                <input type="text" name="cargo" placeholder="Cargo" value={pepDetails.cargo} onChange={e => setPepDetails('cargo', e.target.value)} maxLength="30" />
            </div>
          )}
        </>
    )}
      <div className="declarations">
        <div className="declaration-container">
          <input type="checkbox" id="declaration1" checked={declaration1} onChange={(e) => setDeclaration1(e.target.checked)} />
          <label htmlFor="declaration1">
            Declaro que la información suministrada es veraz, exacta y actual. Autorizo a xxxxx para recabar información y verificarla.
          </label>
        </div>
        <div className="declaration-container">
          <input type="checkbox" id="declaration2" checked={declaration2} onChange={(e) => setDeclaration2(e.target.checked)} />
          <label htmlFor="declaration2">
            Declaro que los fondos depositados en mi cuenta no provienen ni serán utilizados para actividades ilícitas, blanqueo de capitales o financiación del terrorismo.
          </label>
        </div>
      </div>
    </div>
  );
};

export default DeclarationsForm;


