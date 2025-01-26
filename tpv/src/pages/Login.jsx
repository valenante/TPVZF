import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Login = () => {
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Resetear errores previos
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      const { accessToken, user } = response.data;

      console.log(accessToken, user, 'nashe');

      // Guardar el token en el localStorage
      localStorage.setItem("token", accessToken);

      // Redirigir según el rol del usuario
      switch (user.role) {
        case "admin":
          navigate("/");
          break;
        case "cocinero":
          navigate("/cocina");
          break;
        case "camarero":
          navigate("/mesas");
          break;
        default:
          throw new Error("Rol de usuario desconocido");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      const errorMsg =
        error.response?.data?.error || "Ocurrió un problema al iniciar sesión.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <label>
            Nombre de usuario:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Contraseña:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

export default Login;
