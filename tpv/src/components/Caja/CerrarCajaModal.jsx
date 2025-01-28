import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import "./CerrarCajaModal.css";

const CerrarCajaModal = ({ onClose }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [totalCaja, setTotalCaja] = useState(0);
  const [metodoPago, setMetodoPago] = useState({
    efectivo: 0,
    tarjeta: 0,
    propina: 0,
  });
  const [accion, setAccion] = useState(""); // Acción: "retirar" o "integrar"
  const [monto, setMonto] = useState(""); // Monto para modificar caja
  const [razon, setRazon] = useState(""); // Razón para modificar caja
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCaja = async () => {
      try {
        const response = await api.get("/caja/total");
        setTotalCaja(response.data.total);
        setMetodoPago(response.data.detallesMetodoPago);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener el estado de la caja:", error);
        setError("No se pudo cargar el estado de la caja.");
      }
    };
    fetchCaja();
  }, []);

  const handleAccion = async (tipo) => {
    const montoNumerico = parseFloat(monto);

    if (!monto || !razon) {
      setError("Por favor, introduce un monto válido y una razón.");
      return;
    }

    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      setError("El monto debe ser un número mayor a 0.");
      return;
    }

    if (tipo === "retirar" && montoNumerico > metodoPago.efectivo) {
      setError(`No puedes retirar ${montoNumerico.toFixed(2)} €. Solo hay ${metodoPago.efectivo.toFixed(2)} € disponibles en efectivo.`);
      return;
    }

    // Confirmación antes de realizar la acción
    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas ${tipo === "retirar" ? "retirar" : "integrar"} ${montoNumerico.toFixed(2)} €?`
    );
    if (!confirmacion) return;

    try {
      setIsLoading(true);
      const response = await api.post(`/caja/${tipo}`, {
        monto: montoNumerico,
        razon,
      });

      setTotalCaja(response.data.total);
      setMetodoPago(response.data.detallesMetodoPago);
      setMonto("");
      setRazon("");
      setError("");
      alert(`Dinero ${tipo === "retirar" ? "retirado" : "integrado"} correctamente.`);
      //Refrescar la pagina
      window.location.reload();
    } catch (error) {
      console.error(`Error al ${tipo} dinero:`, error);
      setError(`Error al ${tipo} dinero.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCerrarCaja = async () => {
    if (!password) {
      setError("Por favor, introduce la contraseña.");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/caja/cerrar", { password });
      alert("Caja cerrada correctamente.");
      onClose();
    } catch (error) {
      console.error("Error al cerrar la caja:", error);
      setError("Error al cerrar la caja. Verifica la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay--cerrar-caja">
      <div className="modal-content--cerrar-caja">
        <h2 className="titulo--cerrar-caja">Gestión de Caja</h2>
        {isLoading ? (
          <p className="mensaje-carga--cerrar-caja">Cargando...</p>
        ) : (
          <>
            <p className="total-caja--cerrar-caja">Total de caja: {totalCaja.toFixed(2)} €</p>
            <p className="detalle-caja--cerrar-caja">
              <strong>Efectivo:</strong> {metodoPago.efectivo.toFixed(2)} €<br />
              <strong>Tarjeta:</strong> {metodoPago.tarjeta.toFixed(2)} €<br />
              <strong>Propina:</strong> {metodoPago.propina.toFixed(2)} €
            </p>

            <div className="acciones-caja--cerrar-caja">
              <div className="botones-modificar--cerrar-caja">
                <button
                  onClick={() => setAccion("retirar")}
                  className="boton-retirar--cerrar-caja"
                >
                  Retirar Dinero
                </button>
                <button
                  onClick={() => setAccion("integrar")}
                  className="boton-integrar--cerrar-caja"
                >
                  Integrar Dinero
                </button>
              </div>
              {accion && (
                <>
                  <input
                    type="number"
                    className="input--cerrar-caja"
                    placeholder="Monto"
                    value={monto}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Permitir solo números y un único punto decimal
                      if (/^\d*\.?\d*$/.test(value)) {
                        setMonto(value);
                      }
                    }}
                  />
                  <input
                    type="text"
                    className="input--cerrar-caja"
                    placeholder="Razón"
                    value={razon}
                    onChange={(e) => setRazon(e.target.value)}
                  />
                  {error && <p className="error--cerrar-caja">{error}</p>}
                  <button
                    onClick={() => handleAccion(accion)}
                    className={`boton-confirmar--cerrar-caja ${
                      accion === "retirar" ? "retirar" : "integrar"
                    }`}
                  >
                    Confirmar {accion === "retirar" ? "Retiro" : "Integración"}
                  </button>
                </>
              )}
            </div>

            <div className="acciones-finales--cerrar-caja">
              <h3>Cerrar Caja</h3>
              <input
                type="password"
                className="input--cerrar-caja"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={handleCerrarCaja}
                className="boton--cerrar-caja"
                disabled={isLoading}
              >
                Cerrar Caja
              </button>
              <button onClick={onClose} className="boton-cancelar--cerrar-caja">
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CerrarCajaModal;
