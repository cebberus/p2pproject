import React, { useState } from 'react';
import './EditUsernamePopup.css';

function EditUsernamePopup({ isOpen, onClose, currentUsername, onSave }) {
  const [newUsername, setNewUsername] = useState(currentUsername);

  const handleSave = () => {
    onSave(newUsername);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay-editusername">
      <div className="popup-content-editusername">
        <h3>Editar Username</h3>
        <p>Configura un username personalizado para tu perfil.</p>
        <label>Nombre de usuario</label>
        <input value={newUsername} onChange={e => setNewUsername(e.target.value)} />
        <div>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default EditUsernamePopup;
