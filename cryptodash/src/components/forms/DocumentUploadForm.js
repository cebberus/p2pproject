import React, { useRef, useState } from 'react';

const DocumentUploadForm = () => {
  const [frontImage, setFrontImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFrontImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handlePopupOpen = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="inner-form-container">
      <h3>Carga tu documento de identidad:</h3>
      <div className="document-upload-form">
        <div className="image-box" onClick={handlePopupOpen}>
          {frontImage ? (
            <img src={frontImage} alt="Frente del documento" />
          ) : (
            <div className="upload-icon">Subir</div>
          )}
        </div>
        {showPopup && (
          <div className="overlay"> {/* Capa de superposición */}
            <div className="popup-upload-frontimage">
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
                    <button className="back-button-popup" onClick={handleFileInputClick}>Elegir nueva foto</button>
                    <button className="next-button-popup" onClick={handlePopupClose}>Continuar</button>
                  </>
                ) : (
                  <>
                    <button className="back-button-popup" onClick={handlePopupClose}>Atrás</button>
                    <button className="next-button-popup" onClick={handleFileInputClick}>Subir foto</button>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadForm;
