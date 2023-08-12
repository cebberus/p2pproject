import React, { createContext, useContext, useState } from 'react';

const FormDataContext = createContext();

export const useFormData = () => {
  return useContext(FormDataContext);
};

const PersonalinitialData = {
  nombres: '',
  apellidos: '',
  paisNacimiento: '',
  fechaNacimiento: '',
  sexo: '',
  profesion: '',
  estadoCivil: ''
};

const ResidenceinitialData = {
    paisResidencia: '',
    RegionProvincia: '',
    ciudad: '',
    direccionResidencia: '',
    telefono: ''
  };

  const documentinitialData = {
    tipoDocumento: '',
    numeroDocumento: '',
    paisEmisorDocumento: '',
    fechaEmisionDocumento: ''
  };

  const documentUploadInitialData = {
    frontImage: null,
    backImage: null,
    selfieImage: null,
  }
  const declarationsInitialData = {
    isPEP: null,
    isPEPYou: null,
    declaration1: false,
    declaration2: false,
    pepDetails: {
      nombres: '',
      apellidos: '',
      numeroDocumento: '',
      cargo: ''
    }
  };
  
  

export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    personalData: PersonalinitialData,
    residenceData: ResidenceinitialData,
    documentData: documentinitialData,
    documentUploadData: documentUploadInitialData,
    declarationsData: JSON.parse(localStorage.getItem('declarationsData')) || declarationsInitialData,
  });

  return (
    <FormDataContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};
