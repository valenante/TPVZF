import React, { useState } from "react";
import api from "../utils/api";
import "../styles/Usuarios.css";

const CrearUsuario = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Validaciones
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
          error = "El nombre solo puede contener letras y espacios.";
        }
        break;
      case "contraseña":
        if (value.length < 8 || !/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
          error = "La contraseña debe tener al menos 8 caracteres, una letra y un número.";
        }
        break;
      case "confirmarContraseña":
        if (value !== formData.contraseña) {
          error = "Las contraseñas no coinciden.";
        }
        break;
      case "role":
        if (!["admin", "cocinero", "camarero"].includes(value)) {
          error = "El role seleccionado no es válido.";
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        name: formData.nombre,
        password: formData.contraseña,
        role: formData.role,
      });
      alert("Usuario creado exitosamente.");
      setFormData({ name: "", password: "", confirmPassword: "", role: "" });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      alert("Hubo un error al crear el usuario.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="crear-usuario--register">
      <h2 className="titulo--register">Crear Usuario</h2>
      <form onSubmit={handleSubmit} className="formulario--register">
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="input--register"
          placeholder="Nombre"
        />
        {errors.nombre && <p className="error--register">{errors.nombre}</p>}

        <input
          type="password"
          name="contraseña"
          value={formData.contraseña}
          onChange={handleChange}
          className="input--register"
          placeholder="Contraseña"
        />
        {errors.contraseña && <p className="error--register">{errors.contraseña}</p>}

        <input
          type="password"
          name="confirmarContraseña"
          value={formData.confirmarContraseña}
          onChange={handleChange}
          className="input--register"
          placeholder="Confirmar Contraseña"
        />
        {errors.confirmarContraseña && (
          <p className="error--register">{errors.confirmarContraseña}</p>
        )}

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="select--register"
        >
          <option value="">Selecciona un rol</option>
          <option value="admin">Admin</option>
          <option value="cocinero">Cocinero</option>
          <option value="camarero">Camarero</option>
        </select>
        {errors.role && <p className="error--register">{errors.role}</p>}

        <button
          type="submit"
          className="boton--register"
          disabled={isLoading}
        >
          {isLoading ? "Creando..." : "Crear Usuario"}
        </button>
      </form>
    </div>
  );
};

export default CrearUsuario;
