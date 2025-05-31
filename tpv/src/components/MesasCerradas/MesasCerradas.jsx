import React, { useEffect, useState } from "react";
import api from "../../utils/api"; // Importa la configuración de axios
import "./MesasCerradas.css"; // Importa el archivo de estilos
import ModalConfirmacion from "../Modal/ModalConfirmacion"; // Importa el componente de modal
import AlertaMensaje from "../AlertaMensaje/AlertaMensaje";

const MesasCerradas = () => {
  const [mesas, setMesas] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [accionModal, setAccionModal] = useState(null);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

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
  const crearMesa = () => {
    setAccionModal({
      titulo: "Crear Mesa",
      mensaje: "Introduce el número de la mesa que deseas crear (solo números):",
      placeholder: "Número de mesa",
      onConfirm: async (numeroMesaInput) => {
        if (!numeroMesaInput || isNaN(numeroMesaInput) || parseInt(numeroMesaInput, 10) <= 0) {
          setMensajeAlerta({ tipo: "error", mensaje: "Por favor, introduce un número válido." });
          return;
        }

        try {
          setIsLoading(true);
          const response = await api.post("/mesas/crear-mesa/crear-mesa", { numero: parseInt(numeroMesaInput, 10) });
          setMensajeAlerta({ tipo: "exito", mensaje: "Mesa creada exitosamente." });
        } catch (error) {
          console.error("Error al crear la mesa:", error);
          setMensajeAlerta({ tipo: "error", mensaje: error.response?.data?.error || "Error al crear la mesa." });
        } finally {
          setIsLoading(false);
        }
      },
    });

    setMostrarModalConfirmacion(true);
  };

  // Función para eliminar una mesa
  const eliminarMesa = () => {
    setAccionModal({
      titulo: "Eliminar Mesa",
      mensaje: "Introduce el número de la mesa que deseas eliminar (solo números):",
      placeholder: "Número de mesa",
      onConfirm: async (numeroMesaInput) => {
        if (!numeroMesaInput || isNaN(numeroMesaInput) || parseInt(numeroMesaInput, 10) <= 0) {
          setMensajeAlerta({ tipo: "error", mensaje: "Por favor, introduce un número válido." });
          return;
        }

        try {
          setIsLoading(true);
          await api.delete(`/mesas/eliminar-mesa?numero=${numeroMesaInput}`);
          setMensajeAlerta({ tipo: "exito", mensaje: "Mesa eliminada exitosamente." });
        } catch (error) {
          console.error("Error al eliminar la mesa:", error);
          setMensajeAlerta({ tipo: "error", mensaje: error.response?.data?.error || "Error al eliminar la mesa." });
        } finally {
          setIsLoading(false);
        }
      },
    });

    setMostrarModalConfirmacion(true);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="mesas-cerradas--mesas-cerradas">
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
      {mostrarModalConfirmacion && (
        <ModalConfirmacion
          titulo={accionModal?.titulo}
          mensaje={accionModal?.mensaje}
          placeholder={accionModal?.placeholder}
          onConfirm={(valor) => {
            accionModal?.onConfirm(valor);
            setMostrarModalConfirmacion(false);
          }}
          onClose={() => setMostrarModalConfirmacion(false)}
        />
      )}

      {mensajeAlerta && (
        <AlertaMensaje
          tipo={mensajeAlerta.tipo}
          mensaje={mensajeAlerta.mensaje}
          onClose={() => setMensajeAlerta(null)}
        />
      )}
    </div>
  );
};

export default MesasCerradas;
