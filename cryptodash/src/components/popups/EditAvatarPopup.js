import React, { useState, useEffect } from 'react';
import './EditAvatarPopup.css'; // Asumiendo que tienes un archivo CSS para estilos

function EditAvatarPopup({ isOpen, onClose, currentAvatar, onSave, token  }) {
    const [avatars, setAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

    useEffect(() => {
        if (isOpen) {
            // Obtener la lista de avatares del servidor solo cuando el popup esté abierto
            fetch('http://localhost:3001/api/avatars', {
                headers: {
                    'Authorization': token // Añadimos el token aquí
                }
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Error al obtener avatares');
                }
                return res.json();
            })
            .then(data => {
                setAvatars(data);
            })
            .catch(error => {
                console.error(error.message);
            });
        }
    }, [isOpen, token]);

    const handleSave = () => {
        // Parsear la URL completa
        const parsedUrl = new URL(selectedAvatar);
    
        // Obtener solo la ruta (path) de la URL
        let relativePath = parsedUrl.pathname;
    
        // Si la ruta comienza con "/", quitar ese carácter
        if (relativePath.startsWith('/')) {
            relativePath = relativePath.substring(1);
        }
    
        onSave(relativePath); // Pasar la ruta relativa
        onClose();
    };
    
    
    
    

    if (!isOpen) return null;

    return (
        <div className="popup-overlay-editavatar">
            <div className="popup-content-editavatar">
                <h3>Seleccionar un avatar</h3>
                <div className="avatars-list">
                    {avatars.map(avatar => (
                        <div 
                            key={avatar} 
                            className={`avatar-circle ${avatar === selectedAvatar ? 'highlighted' : ''}`} 
                            onClick={() => setSelectedAvatar(avatar)}
                        >
                            <img src={avatar} alt="Avatar" />
                        </div>
                    ))}
                </div>
                <div>
                    <button onClick={onClose}>Cancelar</button>
                    <button onClick={handleSave}>Guardar</button>
                </div>
            </div>
        </div>
    );
}

export default EditAvatarPopup;

