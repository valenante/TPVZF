import React, { useState } from "react";
import "./MetodoPago.css";
import "../Modal/ModalConfirmacion";

const MetodoPagoModal = ({ total, onClose, onConfirm }) => {
  const [efectivo, setEfectivo] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [propina, setPropina] = useState(""); // Campo separado para propina
  const [error, setError] = useState("");
  const [mostrarConfirmacionFinal, setMostrarConfirmacionFinal] = useState(false);
  const [confirmacionMensaje, setConfirmacionMensaje] = useState("");

  const handleConfirm = () => {
    const efectivoValue = parseFloat(efectivo) || 0;
    const tarjetaValue = parseFloat(tarjeta) || 0;
    const propinaValue = parseFloat(propina) || 0;
    const totalPago = efectivoValue + tarjetaValue;

    if (totalPago < total) {
      setError(
        `El total ingresado (${totalPago.toFixed(2)} €) es menor que el total de la mesa (${total.toFixed(2)} €).`
      );
      return;
    }

    const cambio = totalPago - total;
    const mensaje = `El cliente ha pagado ${totalPago.toFixed(2)} €. ${cambio > 0
      ? `Debe devolver ${cambio.toFixed(2)} €.`
      : `Sin cambio.`}${propinaValue > 0
        ? ` Además, ha dejado una propina de ${propinaValue.toFixed(2)} €.`
        : ''
      } ¿Deseas confirmar este pago?`;

    setConfirmacionMensaje(mensaje);
    setMostrarConfirmacionFinal(true);
  };

  return (
    <div className="modal--cuenta">
      <div className="modal-content--cuenta">
        <h2 className="titulo--cuenta">Método de Pago</h2>
        <p className="total--cuenta">Total: {total.toFixed(2)} €</p>
        <label className="label--cuenta">
          Efectivo:
          <input
            type="number"
            min="0"
            value={efectivo}
            onChange={(e) => setEfectivo(e.target.value)} // Permite borrar el valor
            className="input--cuenta"
          />
        </label>
        <label className="label--cuenta">
          Tarjeta:
          <input
            type="number"
            min="0"
            value={tarjeta}
            onChange={(e) => setTarjeta(e.target.value)} // Permite borrar el valor
            className="input--cuenta"
          />
        </label>
        <label className="label--cuenta">
          Propina (opcional):
          <input
            type="number"
            min="0"
            value={propina}
            onChange={(e) => setPropina(e.target.value)} // Permite borrar el valor
            className="input--cuenta"
          />
        </label>
        {error && <p className="error--cuenta">{error}</p>}
        <div className="botones--cuenta">
          <button onClick={onClose} className="boton-cancelar--cuenta">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="boton-confirmar--cuenta">
            Confirmar
          </button>
        </div>
      </div>
      {mostrarConfirmacionFinal && (
        <div className="modal--cuenta">
          <div className="modal-content--cuenta">
            <p>{confirmacionMensaje}</p>
            <div className="botones--cuenta">
              <button onClick={() => setMostrarConfirmacionFinal(false)} className="boton-cancelar--cuenta">
                Cancelar
              </button>
              <button
                onClick={() => {
                  onConfirm({
                    efectivo: parseFloat(efectivo) || 0,
                    tarjeta: parseFloat(tarjeta) || 0,
                    propina: parseFloat(propina) || 0,
                    cambio: (parseFloat(efectivo) || 0) + (parseFloat(tarjeta) || 0) - total
                  });
                }}
                className="boton-confirmar--cuenta"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetodoPagoModal;
