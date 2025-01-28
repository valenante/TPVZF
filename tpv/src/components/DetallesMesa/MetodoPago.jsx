import React, { useState } from "react";
import "./MetodoPago.css";

const MetodoPagoModal = ({ total, onClose, onConfirm }) => {
  const [efectivo, setEfectivo] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [propina, setPropina] = useState(""); // Campo separado para propina
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const efectivoValue = parseFloat(efectivo) || 0;
    const tarjetaValue = parseFloat(tarjeta) || 0;
    const propinaValue = parseFloat(propina) || 0; // Propina como campo independiente
    const totalPago = efectivoValue + tarjetaValue;

    if (totalPago < total) {
      setError(
        `El total ingresado (${totalPago.toFixed(2)} €) es menor que el total de la mesa (${total.toFixed(2)} €).`
      );
      return;
    }

    const confirmacion = window.confirm(
      `El total ingresado es ${totalPago.toFixed(2)} €.\n${
        propinaValue > 0 ? `Incluye una propina de ${propinaValue.toFixed(2)} €.` : ""
      } ¿Estás seguro de confirmar este método de pago?`
    );

    if (!confirmacion) return;

    onConfirm({ efectivo: efectivoValue, tarjeta: tarjetaValue, propina: propinaValue });
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
    </div>
  );
};

export default MetodoPagoModal;
