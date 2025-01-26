import React from "react";
import { Navigate } from "react-router-dom";

// Componente para proteger rutas
const RutaProtegida = ({ children, rolesPermitidos = [] }) => {
  const token = localStorage.getItem("token");

  console.log('Laburando RutaProtegida.jsx');

  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Decodificar el payload del token (usando atob para la parte intermedia del JWT)
  const payload = JSON.parse(atob(token.split(".")[1]));

  // Verificar si el usuario tiene un rol permitido
  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(payload.role)) {
    return <Navigate to="/login" />; // Redirigir si no tiene el rol adecuado
  }

  return children; // Renderizar el contenido protegido
};

export default RutaProtegida;
