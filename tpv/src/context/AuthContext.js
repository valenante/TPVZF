import { createContext, useContext, useState, useEffect } from "react";
import renovarToken from "../utils/RenovarToken";
import api from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [sessionActive, setSessionActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  console.log(user, 'usuario');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await renovarToken(setAccessToken);
        if (token) {
          setAccessToken(token);
        } else {
          setSessionActive(false);
        }
      } catch (error) {
        console.error("Error al inicializar la autenticación:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me/me", { withCredentials: true });
        setUser(response.data.user);
        console.log(response.data.user, 'usuario');
      } catch (error) {
        console.error("No autenticado:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);


  useEffect(() => {
    if (!sessionActive || location.pathname === "/login") {
      return;
    }

    if (!accessToken) {
      renovarToken(setAccessToken);
    }
  }, [accessToken, sessionActive, location.pathname]);

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      setAccessToken(null);
      setUser(null); // Limpia el usuario al cerrar sesión
      setSessionActive(false);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return <p>Cargando autenticación...</p>; // Evita que la aplicación falle antes de definir `setUser`
  }

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, sessionActive, logout, loading, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
