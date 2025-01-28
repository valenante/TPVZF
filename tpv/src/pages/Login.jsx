import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      const response = await fetch("http://172.20.10.7:3000/api/auth/login", {
        method: "POST",
        credentials: "include", // Para incluir cookies
        headers: {
          "Content-Type": "application/json", // Asegurar el tipo de contenido
        },
        body: JSON.stringify(formData), // Convertir los datos del formulario a JSON
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ocurrió un error desconocido");
      }
  
      const data = await response.json();
      console.log("Ruta de la petición:", response.url); // Mostrar la URL de la petición
      console.log("Respuesta del servidor:", data);

  
      const { accessToken, user } = data;
  
      // Actualizar el contexto con el nuevo token
      setAccessToken(accessToken);
  
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
        error.message || "Ocurrió un problema al iniciar sesión.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };  
  
  return (
    <div className="login--login">
      <h2 className="titulo--login">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="formulario--login">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input--login"
          placeholder="Nombre de usuario"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="input--login"
          placeholder="Contraseña"
        />
        {error && <p className="error--login">{error}</p>}
        <button type="submit" disabled={isLoading} className="boton--login">
          {isLoading ? "Iniciando sesión..." : "Ingresar"}
        </button>
      </form>
    </div>
  );  
};

export default Login;
