import React, { useState, useEffect } from "react";
import api from "../../utils/api"; // Asegúrate de configurar tu cliente API

const PasswordModal = ({ onClose }) => {
  const [password, setPassword] = useState(""); // Estado para la contraseña
  const [isLoading, setIsLoading] = useState(false); // Para mostrar el estado de carga
  const [isNewPassword, setIsNewPassword] = useState(true); // Indica si es la primera vez

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
    alert("La contraseña no puede estar vacía");
    return;
  }

  setIsLoading(true);

  try {
    if (isNewPassword) {
      await api.post("/password", { valor: password }); // Guardar la contraseña por primera vez
    } else {
      await api.put("/password", { valor: password }); // Actualizar la contraseña existente
    }
    alert("Contraseña guardada exitosamente");
    onClose(); // Cerrar el modal
  } catch (error) {
    console.error("Error al guardar la contraseña:", error);
    alert("Error al guardar la contraseña");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isNewPassword ? "Establecer Contraseña" : "Actualizar Contraseña"}</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Introduce la contraseña"
        />
        <div className="modal-actions">
          <button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
