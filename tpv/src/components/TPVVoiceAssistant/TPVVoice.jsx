import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { interpretarComando } from '../../utils/parserVoz';
import { ejecutarAccionVoz } from '../../utils/ejecutarAccionVoz';
import AlertaMensaje from '../AlertaMensaje/AlertaMensaje'; // Ajusta la ruta si hace falta
import './TPVVoice.css';

const TPVVoice = () => {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [procesando, setProcesando] = useState(false);

  // Estado para la alerta
  const [alerta, setAlerta] = useState({ visible: false, tipo: 'info', mensaje: '' });

  const iniciarEscucha = () => {
    resetTranscript();
    setProcesando(false);
    setAlerta({ visible: false, tipo: 'info', mensaje: '' });
    SpeechRecognition.startListening({
      language: 'es-ES',
      continuous: false,
    });
  };

  useEffect(() => {
    if (!listening && transcript && !procesando) {
      setProcesando(true);
      (async () => {
        const accion = interpretarComando(transcript);
        if (!accion) {
          setAlerta({ visible: true, tipo: 'error', mensaje: 'No se entendió el comando.' });
          setProcesando(false);
          resetTranscript();
          return;
        }
        try {
          await ejecutarAccionVoz(accion);
          setAlerta({ visible: true, tipo: 'exito', mensaje: `${accion.producto} agregado a la mesa ${accion.mesa}` });
        } catch (err) {
          setAlerta({ visible: true, tipo: 'error', mensaje: 'Error al ejecutar la acción.' });
          console.error(err);
        }
        setProcesando(false);
        resetTranscript();
      })();
    }
  }, [listening, transcript, procesando, resetTranscript]);

  return (
    <div className="tpv-voz-container">
      <button
        onClick={iniciarEscucha}
        className={`boton-mic ${listening ? 'escuchando' : ''}`}
        disabled={listening}
      >
        {listening ? '🎙️ Escuchando...' : '🎙️ Escuchar'}
      </button>

      <p className={`transcripcion ${listening ? 'visible' : ''}`}>
        {transcript || '¿?'}
      </p>

      <p className="estado">Escuchando: {listening ? "✅" : "⛔"}</p>

      {alerta.visible && (
        <AlertaMensaje
          tipo={alerta.tipo === 'exito' ? 'success' : alerta.tipo} // 'exito' -> 'success' para css
          mensaje={alerta.mensaje}
          onClose={() => setAlerta({ ...alerta, visible: false })}
          autoCerrar={true}
          duracion={3000}
        />
      )}
    </div>
  );
};

export default TPVVoice;
