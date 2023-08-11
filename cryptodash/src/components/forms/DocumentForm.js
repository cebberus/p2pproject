import React, { useEffect, useState } from 'react';
import { useFormData } from './FormDataContext';

const DocumentForm = ({ validateForm }) => {
  const { formData, setFormData } = useFormData();
  const [localFormData, setLocalFormData] = useState(formData.documentData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newLocalFormData = {
      ...localFormData,
      [name]: value
    };
    setLocalFormData(newLocalFormData);
    setFormData({
      ...formData,
      documentData: newLocalFormData
    });
  };

  useEffect(() => {
    const isValid = Object.values(localFormData).every((field) => field !== '');
    console.log("localFormData:", localFormData);
    console.log("isValid:", isValid);
    validateForm(isValid);
  }, [localFormData, validateForm]);


  const handleDateChange = (e) => {
    const { value } = e.target;
    let newValue = value.replace(/\D/g, ''); // Elimina cualquier carácter no numérico
    if (newValue.length > 4) {
      newValue = newValue.slice(0, 4) + '/' + newValue.slice(4);
    }
    if (newValue.length > 2) {
      newValue = newValue.slice(0, 2) + '/' + newValue.slice(2);
    }
    const newLocalFormData = {
      ...localFormData,
      fechaEmisionDocumento: newValue
    };
    setLocalFormData(newLocalFormData);
    setFormData({
      ...formData,
      documentData: newLocalFormData
    });
  };
  



  return (
    <div className="inner-form-container">
      <div className="document-form">
        <select name="tipoDocumento" placeholder="Tipo de documento" value={localFormData.tipoDocumento} onChange={handleChange}>
          <option value="">Seleccione un documento</option>
          <option value="DocumentoIdentidad">Documento de identidad</option>
          <option value="Pasaporte">Pasaporte</option>
          {/* Aquí puedes agregar las opciones para cada país*/}
        </select>
        <input type="text" name="numeroDocumento" placeholder="Número de documento" value={localFormData.numeroDocumento} onChange={handleChange} />
        <select name="paisEmisorDocumento" placeholder="País emisor" value={localFormData.paisEmisorDocumento} onChange={handleChange} >
          <option value="">Seleccione una país</option>
          <option value="Chile">Chile</option>
        </select>
        <input type="text" name="fechaEmisionDocumento" placeholder="Fecha de emisión (DD/MM/AAAA)" value={localFormData.fechaEmisionDocumento} onChange={handleDateChange} maxLength="10"/>
      </div>
    </div>
  );
};

export default DocumentForm;