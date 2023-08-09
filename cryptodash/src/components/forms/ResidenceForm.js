import React, { useState } from 'react';


const ResidenceForm = () => {
    return (
      <form className="datos-personales">
        <label>Nombres:</label>
        <input type="text" name="nombres" />
        <label>Apellidos:</label>
        <input type="text" name="apellidos" />
        {/* Continúa con los demás campos aquí */}
        <button type="button">Cancelar</button>
        <button type="button">Siguiente</button>
      </form>
    );
  };

export default ResidenceForm;