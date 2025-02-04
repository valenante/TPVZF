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
                const response = await fetch(`${process.env.REACT_APP_API_URL}/mesas`);
                const data = await response.json();
                setMesas(data);

                // Obtener número de mesa desde la URL
                const pathParts = location.pathname.split("/").filter(Boolean);
                const numeroMesa = pathParts[0]; // El primer segmento de la URL es el número de la mesa

                if (!isNaN(numeroMesa)) {
                    // Buscar la mesa por número
                    const mesaEncontrada = data.find(mesa => mesa.numero === Number(numeroMesa));
                    if (mesaEncontrada) {
                        setMesaId(mesaEncontrada._id); // Guardar el ID de la mesa en el estado global
                    } else {
                        console.warn(`No se encontró una mesa con el número ${numeroMesa}`);
                    }
                } else {
                    console.warn("El número de mesa en la URL no es válido:", numeroMesa);
                }
            } catch (error) {
                console.error("Error al obtener mesas:", error);
            }
        };

        fetchMesas();
    }, []); // Se ejecuta cada vez que cambia la URL

    return (
        <MesasContext.Provider value={{ mesas, mesaId }}>
            {children}
        </MesasContext.Provider>
    );
};

// Hook personalizado para acceder al contexto
export const useMesas = () => useContext(MesasContext);
