import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ name: "", password: "" });
  const { setUser } = useAuth();
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include", // Para incluir cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ocurrió un error desconocido");
      }
  
      const data = await response.json();
      const { accessToken, user } = data;
  
      setAccessToken(accessToken);
      setUser(user);
  
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
    
      // Mostrar solo errores definidos por el servidor, o genérico si es técnico
      if (error.message && !error.message.includes("The string did not match")) {
        setError(error.message);
      } else {
        setError("No se pudo iniciar sesión. Por favor, verifica tus datos o intenta más tarde.");
      }    
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
