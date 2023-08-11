import React, { useEffect, useState } from 'react';
import { useFormData } from './FormDataContext';

const ResidenceForm = ({ validateForm }) => {
  const { formData, setFormData } = useFormData();
  const [localFormData, setLocalFormData] = useState(formData.residenceData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newLocalFormData = {
      ...localFormData,
      [name]: value
    };
    setLocalFormData(newLocalFormData);
    setFormData({
      ...formData,
      residenceData: newLocalFormData
    });
  };

  useEffect(() => {
    const isValid = Object.values(localFormData).every((field) => field !== '');
    console.log("localFormData:", localFormData);
    console.log("isValid:", isValid);
    validateForm(isValid);
  }, [localFormData, validateForm]);

  return (
    <div className="inner-form-container">
      <div className="residence-form">
        <select name="paisResidencia" placeholder="País de residencia" value={localFormData.paisResidencia} onChange={handleChange}>
          <option value="">Seleccione un país</option>
          <option value="Chile">Chile</option>
          {/* Aquí puedes agregar las opciones para cada país*/}
        </select>
        <select name="RegionProvincia" placeholder="Región/Provincia" value={localFormData.RegionProvincia} onChange={handleChange} >
          <option value="">Región/Provincia</option>
          <option value="RM">Región Metropolitana</option>
        </select>
        <select type="text" name="ciudad" placeholder="Ciudad" value={localFormData.ciudad} onChange={handleChange} >
        <option value="">Seleccione una ciudad</option>
          <option value="PuenteAlto">Puente Alto</option>
        </select>
        <input type="text" name="direccionResidencia" placeholder="Dirección de residencia" value={localFormData.direccionResidencia} onChange={handleChange} />
        <input type="text" name="telefono" placeholder="Teléfono" value={localFormData.telefono} onChange={handleChange} />
      </div>
    </div>
  );
};

export default ResidenceForm;
