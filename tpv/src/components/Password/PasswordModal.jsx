import React, { useState, useEffect } from "react";
import api from "../../utils/api"; // Asegúrate de configurar tu cliente API
import "./PasswordModal.css"; // Estilos CSS para el modal
import AlertaMensaje from "../AlertaMensaje/AlertaMensaje"; // Componente de alerta

const PasswordModal = ({ onClose }) => {
  const [password, setPassword] = useState(""); // Estado para la contraseña
  const [isLoading, setIsLoading] = useState(false); // Para mostrar el estado de carga
  const [isNewPassword, setIsNewPassword] = useState(true); // Indica si es la primera vez
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [mensajeAlerta, setMensajeAlerta] = useState(null); // Estado para mostrar mensajes de alerta

  // Cargar la contraseña actual desde la base de datos
  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const response = await api.get("/password");
        if (response.data.password) {
          setPassword(response.data.password);
          setIsNewPassword(false);
        }
      } catch (error) {
        console.error("Error al obtener la contraseña:", error);
      }
    };

    fetchPassword();
  }, []);

  // Guardar o actualizar la contraseña
  const handleSave = async () => {
    if (!password.trim()) {
      setMensajeAlerta({ tipo: "error", mensaje: "La contraseña no puede estar vacía." });
      return;
    }

    setIsLoading(true);

    try {
      if (isNewPassword) {
        await api.post("/password", { valor: password });
      } else {
        await api.put("/password", { valor: password });
      }

      setMensajeAlerta({ tipo: "exito", mensaje: "Contraseña guardada exitosamente." });

      // Opcional: cerrar el modal después de mostrar el mensaje
      setTimeout(() => {
        onClose();
      }, 2000); // Cierra después de 2 segundos
    } catch (error) {
      console.error("Error al guardar la contraseña:", error);
      setMensajeAlerta({ tipo: "error", mensaje: "Error al guardar la contraseña." });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="modal-overlay--password">
      <div className="modal-content--password">
        <h2 className="titulo--password">
          {isNewPassword ? "Establecer Contraseña" : "Actualizar Contraseña"}
        </h2>
        <div className="input-container--password">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Introduce la contraseña"
            className="input--password"
          />
          <button
            type="button"
            className="toggle-visibility--password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "X" : "👁️"}
          </button>
        </div>
        <div className="modal-actions--password">
          <button onClick={handleSave} disabled={isLoading} className="boton--password">
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={onClose} className="boton-cancelar--password">
            Cancelar
          </button>
        </div>
      </div>
      {mensajeAlerta && (
        <AlertaMensaje
          tipo={mensajeAlerta.tipo}
          mensaje={mensajeAlerta.mensaje}
          onClose={() => setMensajeAlerta(null)}
        />
      )}
    </div>
  );
};

export default PasswordModal;
