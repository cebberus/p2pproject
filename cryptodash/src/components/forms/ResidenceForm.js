import React, { useEffect, useState } from 'react';
import { useFormData } from './FormDataContext';
import countries from './countriesResidence.json';
import errorIcon from '../../assets/error-icon.png';
import completeIcon from '../../assets/complete-icon.png';

const ResidenceForm = ({ validateForm }) => {
  const { formData, setFormData } = useFormData();
  const [localFormData, setLocalFormData] = useState(formData.residenceData);
  const [visitedFields, setVisitedFields] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    const country = countries.paises.find(c => c.pais === localFormData.paisResidencia);
    setSelectedCountry(country);
    if (country) {
      const region = country?.regiones.find(r => r.region === localFormData.RegionProvincia);
      setSelectedRegion(region);
    }
  }, []);

  const handleCountryChange = (e) => {
    const country = countries.paises.find(c => c.pais === e.target.value);
    setSelectedCountry(country);
    handleChange(e);
  };

  const handleRegionChange = (e) => {
    const region = selectedCountry?.regiones.find(r => r.region === e.target.value);
    setSelectedRegion(region);
    handleChange(e);
  };

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


  const handleBlur = (e) => {
    const { name } = e.target;
    setVisitedFields({
      ...visitedFields,
      [name]: true
    });
  };

  const getErrorClass = (fieldName) => {
    if (!visitedFields[fieldName]) return '';
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
      <div className="residence-form">
        <div className={`input-container ${getErrorClass('paisResidencia')}`}>
          <select name="paisResidencia" value={localFormData.paisResidencia} onChange={handleCountryChange} onBlur={handleBlur}>
            <option value="">Seleccione un país</option>
            {countries.paises.map((country, index) => (
              <option key={index} value={country.pais}>{country.pais}</option>
            ))}
          </select>
          {visitedFields['paisResidencia'] && localFormData.paisResidencia === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('paisResidencia') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('RegionProvincia')}`}>
          <select name="RegionProvincia" value={localFormData.RegionProvincia} onChange={handleRegionChange} onBlur={handleBlur} disabled={!selectedCountry}>
            <option value="">Región/Provincia</option>
            {selectedCountry?.regiones.map((region, index) => (
              <option key={index} value={region.region}>{region.region}</option>
            ))}
          </select>
          {visitedFields['RegionProvincia'] && localFormData.RegionProvincia === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('RegionProvincia') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('ciudad')}`}>
          <select name="ciudad" value={localFormData.ciudad} onChange={handleChange} onBlur={handleBlur} disabled={!selectedRegion}>
            <option value="">Seleccione una ciudad</option>
            {selectedRegion?.comunas.map((ciudad, index) => (
              <option key={index} value={ciudad}>{ciudad}</option>
            ))}
          </select>
          {visitedFields['ciudad'] && localFormData.ciudad === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('ciudad') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('direccionResidencia')}`}>
          <input type="text" name="direccionResidencia" placeholder="Dirección de residencia" value={localFormData.direccionResidencia} onChange={handleChange} onBlur={handleBlur} maxLength="50" />
          {visitedFields['direccionResidencia'] && localFormData.direccionResidencia === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('direccionResidencia') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
        <div className={`input-container ${getErrorClass('telefono')}`}>
          <input type="text" name="telefono" placeholder="Teléfono" value={localFormData.telefono} onChange={handleChange} onBlur={handleBlur} />
          {visitedFields['telefono'] && localFormData.telefono === '' && <img src={errorIcon} alt="error" className="error-icon" />}
          {showCompleteIcon('telefono') && <img src={completeIcon} alt="complete" className="success-icon" />}
        </div>
      </div>
    </div>
  );  
};

export default ResidenceForm;
