import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import renovarToken from '../../utils/RenovarToken';

const RutaProtegida = ({ children }) => {
  const { accessToken, setAccessToken, loading } = useAuth();

  // Mover el useEffect fuera del condicional
  useEffect(() => {
    if (!accessToken) {
      renovarToken(setAccessToken);
    }
  }, [accessToken, setAccessToken]);

  // Manejar el estado de carga al principio del renderizado
  if (loading) {
    return <div>Cargando...</div>; // Mostrar indicador de carga mientras espera
  }

  // Verificar si el usuario está autenticado
  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default RutaProtegida;
