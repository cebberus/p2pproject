//PersonalDataForm.js
import React, { useEffect, useState } from 'react';
import './formstyle.css';
import { useFormData } from './FormDataContext';

const PersonalDataForm = ({ validateForm }) => {
  const { formData, setFormData } = useFormData();
  const [localFormData, setLocalFormData] = useState(formData.personalData);

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
    setLocalFormData({
      ...localFormData,
      fechaNacimiento: newValue
    });
  };



  return (
    <div className="inner-form-container">
      <div className="datos-form">
        <input type="text" name="nombres" placeholder="Nombres" value={localFormData.nombres} onChange={handleChange} />
        <input type="text" name="apellidos" placeholder="Apellidos"value={localFormData.apellidos} onChange={handleChange} />
        <select name="paisNacimiento" placeholder="País de nacimiento"value={localFormData.paisNacimiento} onChange={handleChange}>
          <option value="">Seleccione un país</option>
          <option value="Chile">Chile</option>
          {/* Aquí puedes agregar las opciones para cada país*/}
        </select>
        <input type="text" name="fechaNacimiento" placeholder="Fecha de nacimiento (DD/MM/AAAA)" value={localFormData.fechaNacimiento} onChange={handleDateChange} maxLength="10"/>
        <select name="sexo" placeholder="Sexo" value={localFormData.sexo} onChange={handleChange}>
          <option value="">Seleccione el sexo</option> {/* Opción en blanco */}
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
        </select>
        <input type="text" name="profesion" placeholder="Profesión/Ocupación" value={localFormData.profesion}onChange={handleChange} />
        <select name="estadoCivil" placeholder="Estado civil" value={localFormData.estadoCivil}onChange={handleChange}>
          <option value="">Seleccione el estado civil</option> {/* Opción en blanco */}
          <option value="Soltero">Soltero</option>
          <option value="Casado">Casado</option>
          <option value="Divorciado">Divorciado</option>
          <option value="Separado">Separado</option>
          <option value="Viudo">Viudo</option>
        </select>
      </div>
    </div>
  );  
};

export default PersonalDataForm;

