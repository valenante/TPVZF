import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const MesasContext = createContext();

export const MesasProvider = ({ children }) => {
    const [searchParams] = useSearchParams();
    const numeroMesa = searchParams.get("mesa"); // 🔹 Extraer el número de mesa desde los Query Params
    const [mesas, setMesas] = useState([]);
    const [mesaId, setMesaId] = useState(null);

    useEffect(() => {
        const fetchMesas = async () => {
            try {
                const url = `${process.env.REACT_APP_API_URL}/mesas`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Error en la respuesta del servidor: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                setMesas(data);

                // Validar si hay mesas y si el número de mesa es válido
                if (Array.isArray(data) && data.length > 0 && numeroMesa && !isNaN(numeroMesa)) {
                    const mesaEncontrada = data.find(mesa => mesa.numero === Number(numeroMesa));
                    if (mesaEncontrada) {
                        setMesaId(mesaEncontrada._id);
                    } else {
                        console.warn(`⚠️ No se encontró una mesa con el número ${numeroMesa}`);
                    }
                } else if (!numeroMesa) {
                    console.info("ℹ️ No se especificó número de mesa en la URL. Solo se cargará la carta.");
                } else {
                    console.warn("⚠️ El número de mesa en la URL no es válido o no hay mesas disponibles:", numeroMesa);
                }

            } catch (error) {
                console.error("❌ Error al obtener mesas:", error.message);
            }
        };

        fetchMesas();
    }, [numeroMesa]); // 🔹 Agregar `numeroMesa` como dependencia

    return (
        <MesasContext.Provider value={{ mesas, mesaId, numeroMesa }}>
            {children}
        </MesasContext.Provider>
    );
};

// Hook personalizado para acceder al contexto
export const useMesas = () => useContext(MesasContext);
