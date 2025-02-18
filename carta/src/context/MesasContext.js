import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const MesasContext = createContext();

export const MesasProvider = ({ children }) => {
    const [mesas, setMesas] = useState([]);
    const [mesaId, setMesaId] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchMesas = async () => {
            try {
                const url = `${process.env.REACT_APP_API_URL}/mesas`;
                console.log("Fetching mesas from:", url);
    
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Error en la respuesta del servidor: ${response.status} ${response.statusText}`);
                }
    
                const data = await response.json();
                console.log("Mesas obtenidas:", data);
                setMesas(data);
    
                // Obtener número de mesa desde la URL
                const pathParts = location.pathname.split("/").filter(Boolean);
                const numeroMesa = pathParts[0];
    
                if (!isNaN(numeroMesa)) {
                    const mesaEncontrada = data.find(mesa => mesa.numero === Number(numeroMesa));
                    if (mesaEncontrada) {
                        setMesaId(mesaEncontrada._id);
                    } else {
                        console.warn(`No se encontró una mesa con el número ${numeroMesa}`);
                    }
                } else {
                    console.warn("El número de mesa en la URL no es válido:", numeroMesa);
                }
    
            } catch (error) {
                console.error("Error al obtener mesas:", error.message);
            }
        };
    
        fetchMesas();
    }, []);
    
    return (
        <MesasContext.Provider value={{ mesas, mesaId }}>
            {children}
        </MesasContext.Provider>
    );
};

// Hook personalizado para acceder al contexto
export const useMesas = () => useContext(MesasContext);
