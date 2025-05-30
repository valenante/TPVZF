// VozButton.jsx
import React from 'react';
import './styles.css';

const VozButton = ({ escuchando, onIniciar, onDetener }) => {
  return (
    <div className="voz-button-wrapper">
      {escuchando ? (
        <button className="voz-boton voz-boton-stop" onClick={onDetener}>
          ⏹️ Detener
        </button>
      ) : (
        <button className="voz-boton voz-boton-mic" onClick={onIniciar}>
          🎙️ Hablar
        </button>
      )}
    </div>
  );
};

export default VozButton;
