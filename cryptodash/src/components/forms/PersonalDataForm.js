import React, { useEffect, useState } from 'react';
import './formstyle.css';
import { useFormData } from './FormDataContext';
import countries from './countries.json';
import errorIcon from '../../assets/error-icon.png';
import completeIcon from '../../assets/complete-icon.png';


const PersonalDataForm = ({ validateForm }) => {
  const { formData, setFormData } = useFormData();
  const [localFormData, setLocalFormData] = useState(formData.personalData);
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
      personalData: newLocalFormData
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setVisitedFields({
      ...visitedFields,
      [name]: true
    });
    if (name === 'fechaNacimiento') {
      validateDate();
    }
  };

  useEffect(() => {
    const isValid = Object.values(localFormData).every((field) => field !== '') && localFormData.fechaNacimiento.length === 10 && !dateError;
    validateForm(isValid);
  }, [localFormData, dateError, validateForm]);

  const validateDate = () => {
    if (localFormData.fechaNacimiento.length === 10) {
      const dateParts = localFormData.fechaNacimiento.split('/');
      const dateEntered = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
      const currentDate = new Date();
      const minDate = new Date();
      minDate.setFullYear(currentDate.getFullYear() - 130);
      const maxDate = new Date();
      maxDate.setFullYear(currentDate.getFullYear() - 18);
      if (dateEntered < minDate || dateEntered > maxDate) {
        setDateError("Debes ingresar una fecha válida");
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
    setLocalFormData({
      ...localFormData,
      fechaNacimiento: newValue
    });
  };

  const getErrorClass = (fieldName) => {
    if (!visitedFields[fieldName]) return '';
    if (fieldName === 'fechaNacimiento' && (dateError || localFormData.fechaNacimiento === '')) {
      return 'error-border error-text';
    }
    if (localFormData[fieldName] === '') {
      return 'error-border error-text';
    }
    return 'success-border';
  };

  const showCompleteIcon = (fieldName) => {
    if (fieldName === 'fechaNacimiento') {
      return visitedFields[fieldName] && localFormData.fechaNacimiento !== '' && !dateError;
    }
    return visitedFields[fieldName] && localFormData[fieldName] !== '';
  };

  return (
    <div className="inner-form-container">
      <div className="datos-form">
        <div className={`input-container ${getErrorClass('nombres')}`}>
          <input type="text" name="nombres" placeholder="Nombres" value={localFormData.nombres} onChange={handleChange} onBlur={handleBlur} maxLength="30" />
          {visitedFields['nombres'] && localFormData.nombres === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('nombres') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('apellidos')}`}>
          <input type="text" name="apellidos" placeholder="Apellidos" value={localFormData.apellidos} onChange={handleChange} onBlur={handleBlur} maxLength="30" />
          {visitedFields['apellidos'] && localFormData.apellidos === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('apellidos') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('paisNacimiento')}`}>
          <select name="paisNacimiento" placeholder="País de nacimiento" value={localFormData.paisNacimiento} onChange={handleChange} onBlur={handleBlur}>
            <option value="">Seleccione un país</option>
            {countries.paises.map((country, index) => (
              <option key={index} value={country.pais}>{country.pais}</option>
            ))}
          </select>
          {visitedFields['paisNacimiento'] && localFormData.paisNacimiento === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('paisNacimiento') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('fechaNacimiento')}`}>
          <input type="text" name="fechaNacimiento" placeholder="Fecha de nacimiento (DD/MM/AAAA)" value={localFormData.fechaNacimiento} onChange={handleDateChange} onBlur={handleBlur} maxLength="10"/>
          {visitedFields['fechaNacimiento'] && (dateError || localFormData.fechaNacimiento === '') && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('fechaNacimiento') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        {dateError && <div className="error-message">{dateError}</div>}
        <div className={`input-container ${getErrorClass('sexo')}`}>
          <select name="sexo" placeholder="Sexo" value={localFormData.sexo} onChange={handleChange} onBlur={handleBlur}>
            <option value="">Seleccione el sexo</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
          {visitedFields['sexo'] && localFormData.sexo === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('sexo') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('profesion')}`}>
          <input type="text" name="profesion" placeholder="Profesión/Ocupación" value={localFormData.profesion} onChange={handleChange} onBlur={handleBlur} maxLength="30"/>
          {visitedFields['profesion'] && localFormData.profesion === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('profesion') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('estadoCivil')}`}>
          <select name="estadoCivil" placeholder="Estado civil" value={localFormData.estadoCivil} onChange={handleChange} onBlur={handleBlur}>
            <option value="">Seleccione el estado civil</option>
            <option value="Soltero">Soltero</option>
            <option value="Casado">Casado</option>
            <option value="Divorciado">Divorciado</option>
            <option value="Separado">Separado</option>
            <option value="Viudo">Viudo</option>
          </select>
          {visitedFields['estadoCivil'] && localFormData.estadoCivil === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('estadoCivil') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
      </div>
    </div>
  );
};

export default PersonalDataForm;


