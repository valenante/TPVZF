import React, { useState } from "react";
import "./MetodoPago.css";

const MetodoPagoModal = ({ total, onClose, onConfirm }) => {
  const [efectivo, setEfectivo] = useState(0);
  const [tarjeta, setTarjeta] = useState(0);
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const totalPago = efectivo + tarjeta;

    if (totalPago !== total) {
      setError(`El total ingresado (${totalPago} €) no coincide con el total de la mesa (${total} €).`);
      return;
    }

    onConfirm({ efectivo, tarjeta });
  };

  return (
    <div className="modal--cuenta">
      <div className="modal-content--cuenta">
        <h2 className="titulo--cuenta">Método de Pago</h2>
        <p className="total--cuenta">Total: {total} €</p>
        <label className="label--cuenta">
          Efectivo:
          <input
            type="number"
            value={efectivo}
            onChange={(e) => setEfectivo(Number(e.target.value))}
            className="input--cuenta"
          />
        </label>
        <label className="label--cuenta">
          Tarjeta:
          <input
            type="number"
            value={tarjeta}
            onChange={(e) => setTarjeta(Number(e.target.value))}
            className="input--cuenta"
          />
        </label>
        {error && <p className="error--cuenta">{error}</p>}
        <div className="botones--cuenta">
          <button onClick={onClose} className="boton-cancelar--cuenta">Cancelar</button>
          <button onClick={handleConfirm} className="boton-confirmar--cuenta">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default MetodoPagoModal;
