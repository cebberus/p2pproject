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

export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    personalData: PersonalinitialData,
    residenceData: ResidenceinitialData,
    documentData: documentinitialData,
    documentUploadData: documentUploadInitialData
  });

  return (
    <FormDataContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};
