import React, { useEffect, useState } from 'react';
import { useFormData } from './FormDataContext';
import errorIcon from '../../assets/error-icon.png';
import completeIcon from '../../assets/complete-icon.png';


const DocumentForm = ({ validateForm }) => {
  const { formData, setFormData } = useFormData();
  const [localFormData, setLocalFormData] = useState(formData.documentData);
  const [dateError, setDateError] = useState(null);
  const [visitedFields, setVisitedFields] = useState({});

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
    const isValid = Object.values(localFormData).every((field) => field !== '') && !dateError;
    validateForm(isValid);
  }, [localFormData, dateError, validateForm]);  

  const validateDate = () => {
    if (localFormData.fechaEmisionDocumento.length === 10) {
      const dateParts = localFormData.fechaEmisionDocumento.split('/');
      const dateEntered = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - 10);
      if (dateEntered < maxDate) {
        setDateError("La fecha de emisión no debe superar 10 años");
      } else {
        setDateError(null);
      }
    } else {
      setDateError("Debes ingresar una fecha válida");
    }
  };


  const handleDateChange = (e) => {
    const { value } = e.target;
    let newValue = value.replace(/\D/g, '');
    if (newValue.length > 4) newValue = newValue.slice(0, 4) + '/' + newValue.slice(4);
    if (newValue.length > 2) newValue = newValue.slice(0, 2) + '/' + newValue.slice(2);
    const newLocalFormData = {
      ...localFormData,
      fechaEmisionDocumento: newValue
    };
    setLocalFormData(newLocalFormData);
    setFormData({
      ...formData,
      documentData: newLocalFormData
    });
    if (newValue.length === 10) {
      validateDate();
    }
  };
  

  
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setVisitedFields({
      ...visitedFields,
      [name]: true
    });
    if (name === 'fechaEmisionDocumento') {
      validateDate();
    }
  };

  const getErrorClass = (fieldName) => {
    if (!visitedFields[fieldName]) return '';
    if (fieldName === 'fechaEmisionDocumento' && dateError) {
      return 'error-border error-text';
    }
    if (localFormData[fieldName] === '') {
      return 'error-border error-text';
    }
    return 'success-border';
  };

  const showCompleteIcon = (fieldName) => {
    return visitedFields[fieldName] && localFormData[fieldName] !== '';
  };



  return (
    <div className="inner-form-container">
      <div className="document-form">
        <div className={`input-container ${getErrorClass('tipoDocumento')}`}>
          <select name="tipoDocumento" placeholder="Tipo de documento" value={localFormData.tipoDocumento} onChange={handleChange} onBlur={handleBlur}>
            <option value="">Seleccione un documento</option>
            <option value="DocumentoIdentidad">Documento de identidad</option>
            <option value="Pasaporte">Pasaporte</option>
            {/* Aquí puedes agregar las opciones para cada país*/}
          </select>
          {visitedFields['tipoDocumento'] && localFormData.tipoDocumento === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('tipoDocumento') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('numeroDocumento')}`}>
          <input type="text" name="numeroDocumento" placeholder="Número de documento" value={localFormData.numeroDocumento} onChange={handleChange} onBlur={handleBlur} />
          {visitedFields['numeroDocumento'] && localFormData.numeroDocumento === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('numeroDocumento') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('paisEmisorDocumento')}`}>
          <select name="paisEmisorDocumento" placeholder="País emisor" value={localFormData.paisEmisorDocumento} onChange={handleChange} onBlur={handleBlur}>
            <option value="">Seleccione una país</option>
            <option value="Chile">Chile</option>
          </select>
          {visitedFields['paisEmisorDocumento'] && localFormData.paisEmisorDocumento === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('paisEmisorDocumento') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('fechaEmisionDocumento')}`}>
          <input type="text" name="fechaEmisionDocumento" placeholder="Fecha de emisión (DD/MM/AAAA)" value={localFormData.fechaEmisionDocumento} onChange={handleDateChange} onBlur={handleBlur} maxLength="10"/>
          {visitedFields['fechaEmisionDocumento'] && (dateError || localFormData.fechaEmisionDocumento === '') && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('fechaEmisionDocumento') && !dateError && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        {dateError && <div className="error-message">{dateError}</div>}
      </div>
    </div>
  );
};

export default DocumentForm;