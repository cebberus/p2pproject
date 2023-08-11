import React, { useRef, useState } from 'react';

const DocumentUploadForm = () => {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [showFrontPopup, setShowFrontPopup] = useState(false);
  const [showBackPopup, setShowBackPopup] = useState(false);
  const frontFileInputRef = useRef(null);
  const backFileInputRef = useRef(null);

  const handleFrontImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFrontImage(reader.result);
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

  return (
    <div className="inner-form-container">
      <h3>Carga tu documento de identidad:</h3>
      <div className="document-upload-form">
        <div className="image-upload-section">
          <p className="image-upload-label">Frente del Documento</p> {/* Texto descriptivo */}
          <div className="image-box" onClick={() => setShowFrontPopup(true)}>
            {frontImage ? (
              <img src={frontImage} alt="Frente del documento" />
            ) : (
              <div className="upload-icon">Subir Frente</div>
            )}
          </div>
        </div>
        <div className="image-upload-section">
          <p className="image-upload-label">Reverso del Documento</p> {/* Texto descriptivo */}
          <div className="image-box" onClick={() => setShowBackPopup(true)}>
            {backImage ? (
              <img src={backImage} alt="Reverso del documento" />
            ) : (
              <div className="upload-icon">Subir Reverso</div>
            )}
          </div>
        </div>
        {showFrontPopup && (
          <div className="overlay">
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
          <div className="overlay">
            <div className="popup-upload-backimage">
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
      </div>
    </div>
  );
};

export default DocumentUploadForm;
