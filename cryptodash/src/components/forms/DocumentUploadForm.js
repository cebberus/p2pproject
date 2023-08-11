import React, { useRef, useState } from 'react';
import { useFormData } from './FormDataContext';

const DocumentUploadForm = () => {
  const { formData, setFormData } = useFormData();
  const [frontImage, setFrontImage] = useState(formData.documentUploadData.frontImage);
  const [backImage, setBackImage] = useState(formData.documentUploadData.backImage);
  const [selfieImage, setSelfieImage] = useState(formData.documentUploadData.selfieImage);
  const [showFrontPopup, setShowFrontPopup] = useState(false);
  const [showBackPopup, setShowBackPopup] = useState(false);
  const [showSelfiePopup, setShowSelfiePopup] = useState(false);
  const [takingSelfie, setTakingSelfie] = useState(false);
  const videoRef = useRef(null);
  const frontFileInputRef = useRef(null);
  const backFileInputRef = useRef(null);
  const [photoTaken, setPhotoTaken] = useState(false);


  const handleClosePopup = (popupSetter) => {
    if (popupSetter === setShowSelfiePopup) {
      // Si se está cerrando el popup de la selfie, restablecer el estado relacionado
      setTakingSelfie(false);
      if (!photoTaken) {
        setSelfieImage(null);
      }
  
      // Detener la cámara si está activa
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    }
    popupSetter(false);
  };
  

  const handleFrontImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage = reader.result;
      setFrontImage(newImage);
      setFormData({
        ...formData,
        documentUploadData: {
          ...formData.documentUploadData,
          frontImage: newImage,
        },
      });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleBackImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setBackImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureSelfie = () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      console.error("La cámara no está lista");
      return; // Salir de la función si la cámara no está lista
    }
  
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/png');
    setSelfieImage(image);
    setTakingSelfie(false);
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    setPhotoTaken(true);
  };
  
  const handleTakeSelfie = () => {
    setTakingSelfie(true); // Establece takingSelfie en true
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => {
        console.error("Error accessing the camera:", err);
        setTakingSelfie(false); // Desactivar el modo de toma de selfie si hay un error
        alert("No se pudo acceder a la cámara. Por favor, asegúrate de otorgar los permisos necesarios."); // Puedes mostrar un mensaje al usuario
      });
  };

  const handleRetakeSelfie = () => {
    setPhotoTaken(false);
    setSelfieImage(null); // Elimina la foto tomada
    handleTakeSelfie(); // Activa la cámara para tomar una nueva foto
  };

  const handleRemoveFrontImage = (e) => {
    e.stopPropagation(); // Detiene la propagación del evento de clic
    setFrontImage(null);
    setFormData({
      ...formData,
      documentUploadData: {
        ...formData.documentUploadData,
        frontImage: null,
      },
    });
  };
  
  const handleRemoveBackImage = (e) => {
    e.stopPropagation(); // Detiene la propagación del evento de clic
    setBackImage(null);
    setFormData({
      ...formData,
      documentUploadData: {
        ...formData.documentUploadData,
        backImage: null,
      },
    });
  };
  
  const handleRemoveSelfieImage = (e) => {
    e.stopPropagation(); // Detiene la propagación del evento de clic
    setSelfieImage(null);
    setPhotoTaken(false);
    setFormData({
      ...formData,
      documentUploadData: {
        ...formData.documentUploadData,
        selfieImage: null,
      },
    });
  };

  return (
    <div className="inner-form-container">
      <h3>Carga tu documento de identidad:</h3>
      <div className="document-upload-form">
        <div className="image-upload-section">
          <p className="image-upload-label">Frente del Documento</p>
          <div className="image-box" onClick={() => setShowFrontPopup(true)}>
            {frontImage ? (
              <>
                <img src={frontImage} alt="Frente del documento" />
                <button className="remove-image-button" onClick={handleRemoveFrontImage}>X Eliminar</button>
              </>
            ) : (
              <div className="upload-icon">Subir Frente</div>
            )}
          </div>
        </div>
        <div className="image-upload-section">
          <p className="image-upload-label">Reverso del Documento</p>
          <div className="image-box" onClick={() => setShowBackPopup(true)}>
            {backImage ? (
              <>
                <img src={backImage} alt="Reverso del Documento" />
                <button className="remove-image-button" onClick={handleRemoveBackImage}>X Eliminar</button>
              </>
            ) : (
              <div className="upload-icon">Subir Reverso</div>
            )}
          </div>
        </div>
        <div className="image-upload-section">
          <p className="image-upload-label">Tomar Selfie</p>
          <div className="image-box" onClick={() => setShowSelfiePopup(true)}>
            {selfieImage ? (
              <>
                <img src={selfieImage} alt="Foto Selfie" />
                <button className="remove-image-button" onClick={handleRemoveSelfieImage}>X Eliminar</button>
              </>
            ) : (
              <div className="upload-icon">Tomar Selfie</div>
            )}
          </div>
        </div>
        {showFrontPopup && (
          <div className="overlay" onClick={() => handleClosePopup(setShowFrontPopup)}>
            <div className="popup-upload-frontimage" onClick={e => e.stopPropagation()}>
              <button className="close-button-popup" onClick={() => handleClosePopup(setShowFrontPopup)}>X</button>
              <h4>{frontImage ? "¿Se ve bien la foto?" : "Frente del documento"}</h4>
              <div className="image-container-popup">
                {frontImage ? (
                  <img src={frontImage} alt="Frente del documento" />
                ) : (
                  <div className="placeholder-image-popup"></div>
                )}
              </div>
              <div className="buttons-container-popup">
                {frontImage ? (
                  <>
                    <button className="back-button-popup" onClick={() => frontFileInputRef.current.click()}>Elegir nueva foto</button>
                    <button className="next-button-popup" onClick={() => setShowFrontPopup(false)}>Continuar</button>
                  </>
                ) : (
                  <>
                    <button className="back-button-popup" onClick={() => setShowFrontPopup(false)}>Atrás</button>
                    <button className="next-button-popup" onClick={() => frontFileInputRef.current.click()}>Subir foto</button>
                  </>
                )}
                <input type="file" ref={frontFileInputRef} onChange={handleFrontImageUpload} style={{ display: 'none' }} />
              </div>
            </div>
          </div>
        )}
        {showBackPopup && (
          <div className="overlay" onClick={() => handleClosePopup(setShowBackPopup)}>
            <div className="popup-upload-backimage" onClick={e => e.stopPropagation()}>
              <button className="close-button-popup" onClick={() => handleClosePopup(setShowBackPopup)}>X</button>
              <h4>{backImage ? "¿Se ve bien la foto?" : "Reverso del documento"}</h4>
              <div className="image-container-popup">
                {backImage ? (
                  <img src={backImage} alt="Reverso del documento" />
                ) : (
                  <div className="placeholder-image-popup"></div>
                )}
              </div>
              <div className="buttons-container-popup">
                {backImage ? (
                  <>
                    <button className="back-button-popup" onClick={() => backFileInputRef.current.click()}>Elegir nueva foto</button>
                    <button className="next-button-popup" onClick={() => setShowBackPopup(false)}>Continuar</button>
                  </>
                ) : (
                  <>
                    <button className="back-button-popup" onClick={() => setShowBackPopup(false)}>Atrás</button>
                    <button className="next-button-popup" onClick={() => backFileInputRef.current.click()}>Subir foto</button>
                  </>
                )}
                <input type="file" ref={backFileInputRef} onChange={handleBackImageUpload} style={{ display: 'none' }} />
              </div>
            </div>
          </div>
        )}
      {showSelfiePopup && (
        <div className="overlay" onClick={() => handleClosePopup(setShowSelfiePopup)}>
          <div className="popup-upload-selfie" onClick={e => e.stopPropagation()}>
            <button className="close-button-popup" onClick={() => handleClosePopup(setShowSelfiePopup)}>X</button>
            <h4>{takingSelfie ? "Tomar una Selfie" : "Selfie"}</h4>
            <div className="image-container-popup">
              {takingSelfie ? (
                <video ref={videoRef} autoPlay style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}></video>
              ) : (
                <img src={selfieImage} alt="Selfie" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              )}
            </div>
            <div className="buttons-container-popup">
              {photoTaken ? (
                <button className="back-button-popup" onClick={handleRetakeSelfie}>Tomar nueva foto</button>
              ) : (
                <button className="back-button-popup" onClick={() => handleClosePopup(setShowSelfiePopup)}>Atrás</button>
              )}
              {takingSelfie ? (
                <button className="next-button-popup" onClick={handleCaptureSelfie}>Tomar Foto</button>
              ) : photoTaken ? (
                <button className="next-button-popup" onClick={() => handleClosePopup(setShowSelfiePopup)}>Finalizar</button> // Botón para finalizar
              ) : (
                <button className="next-button-popup" onClick={handleTakeSelfie}>Siguiente</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default DocumentUploadForm;