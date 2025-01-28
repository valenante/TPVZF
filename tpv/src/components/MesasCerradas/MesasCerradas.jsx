import React, { useEffect, useState } from "react";
import api from "../../utils/api"; // Importa la configuración de axios
import "./MesasCerradas.css"; // Importa el archivo de estilos

const MesasCerradas = () => {
  const [mesas, setMesas] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para obtener las mesas activas desde el backend
  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const response = await api.get("/mesas/mesas-cerradas/mesas-cerradas"); // Ajusta el endpoint para obtener mesas activas
        setMesas(response.data);
      } catch (error) {
        console.error("Error al obtener las mesas cerradas:", error);
        setError("Error al obtener las mesas cerradas.");
      }
    };

    fetchMesas();
  }, []);

  // Función para crear una mesa
  const crearMesa = async () => {
    let numeroMesa;

    while (true) {
      numeroMesa = prompt("Introduce el número de la mesa que deseas crear (solo números):");

      // Verifica si el usuario canceló el prompt
      if (numeroMesa === null) return;

      // Validar que el valor sea un número
      if (!isNaN(numeroMesa) && parseInt(numeroMesa, 10) > 0) {
        break; // Salir del bucle si es un número válido
      } else {
        alert("Por favor, introduce un número válido.");
      }
    }

    try {
      setIsLoading(true);
      const response = await api.post("/mesas/crear-mesa/crear-mesa", { numero: parseInt(numeroMesa, 10) });
      alert("Mesa creada exitosamente.");
    } catch (error) {
      console.error("Error al crear la mesa:", error);
      setError(error.response?.data?.error || "Error al crear la mesa.");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar una mesa
  const eliminarMesa = async () => {
    let numeroMesa;

    while (true) {
      numeroMesa = prompt("Introduce el número de la mesa que deseas eliminar (solo números):");

      // Verifica si el usuario canceló el prompt
      if (numeroMesa === null) return;

      // Validar que el valor sea un número
      if (!isNaN(numeroMesa) && parseInt(numeroMesa, 10) > 0) {
        break; // Salir del bucle si es un número válido
      } else {
        alert("Por favor, introduce un número válido.");
      }
    }

    try {
      setIsLoading(true);
      await api.delete(`/mesas/eliminar-mesa?numero=${numeroMesa}`); // Pasa el número como parámetro de consulta
      alert("Mesa eliminada exitosamente.");
    } catch (error) {
      console.error("Error al eliminar la mesa:", error);
      setError(error.response?.data?.error || "Error al eliminar la mesa.");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="mesas-cerradas--mesas-cerradas">
      <h1 className="titulo--mesas-cerradas">Gestión de Mesas Cerradas</h1>
      <div className="botones-container">
        <div className="botones-container-mesas-cerradas">
          <button
            onClick={crearMesa}
            disabled={isLoading}
            className="boton--cerrar-caja"
          >
            {isLoading ? "Creando..." : "Crear Mesa"}
          </button>
          <button
            onClick={eliminarMesa}
            disabled={isLoading}
            className="boton-cancelar--cerrar-caja"
          >
            {isLoading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
      {mesas.length === 0 ? (
        <p className="mensaje-vacio--mesas-cerradas">No hay mesas cerradas.</p>
      ) : (
        <div className="tabla-container--mesas-cerradas">
          <table className="tabla--mesas-cerradas">
            <thead>
              <tr>
                <th>Número</th>
                <th>Hora de Apertura</th>
                <th>Hora de Cierre</th>
                <th>Total</th>
                <th>Métodos de Pago</th>
              </tr>
            </thead>
            <tbody>
              {mesas.map((mesa) => (
                <tr key={mesa._id}>
                  {/* Número de la mesa */}
                  <td>{mesa.numero}</td>

                  {/* Hora de inicio */}
                  <td>{new Date(mesa.inicio).toLocaleTimeString()}</td>

                  {/* Hora de cierre */}
                  <td>{new Date(mesa.cierre).toLocaleTimeString()}</td>

                  {/* Total */}
                  <td>{mesa.total.toFixed(2)} €</td>

                  {/* Métodos de pago */}
                  <td>
                    <div>
                      <strong>Efectivo:</strong> {mesa.metodoPago.efectivo.toFixed(2)} €
                    </div>
                    <div>
                      <strong>Tarjeta:</strong> {mesa.metodoPago.tarjeta.toFixed(2)} €
                    </div>
                    <div>
                      <strong>Propina:</strong> {mesa.metodoPago.propina.toFixed(2)} €
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MesasCerradas;
