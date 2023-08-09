import React, { useState } from 'react';
import './formstyle.css';
import logo from '../../assets/logo.svg';

const PersonalDataForm = ({ onNext }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    paisNacimiento: '',
    fechaNacimiento: '',
    sexo: '',
    profesion: '',
    estadoCivil: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="verification-page-container">
      <div className="form-container">
        <div className="image-container">
          <img src={logo} alt="Descripción de la imagen" />
          <p>Tu texto aquí</p>
        </div>
        <div className="inner-form-container">
          <div className="header-form-container">
            <h1>Hola</h1>
          </div>
          <div className="datos-personales">
            <input type="text" name="nombres" placeholder="Nombres" onChange={handleChange} />
            <input type="text" name="apellidos" placeholder="Apellidos" onChange={handleChange} />
            <select name="paisNacimiento" placeholder="País de nacimiento" onChange={handleChange}>
              {/* Aquí puedes agregar las opciones para cada país */}
            </select>
            <input type="date" name="fechaNacimiento" placeholder="Fecha de nacimiento" onChange={handleChange} />
            <select name="sexo" placeholder="Sexo" onChange={handleChange}>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
            <input type="text" name="profesion" placeholder="Profesión/Ocupación" onChange={handleChange} />
            <select name="estadoCivil" placeholder="Estado civil" onChange={handleChange}>
              <option value="Soltero">Soltero</option>
              <option value="Casado">Casado</option>
              <option value="Divorciado">Divorciado</option>
              <option value="Separado">Separado</option>
              <option value="Viudo">Viudo</option>
            </select>
            <div className="buttons-container">
              <button type="button">Cancelar</button>
              <button type="submit">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default PersonalDataForm;

