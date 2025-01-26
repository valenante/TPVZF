import React, { useState } from "react";

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
    <div className="modal">
      <div className="modal-content">
        <h2>Método de Pago</h2>
        <p>Total: {total} €</p>
        <label>
          Efectivo:
          <input
            type="number"
            value={efectivo}
            onChange={(e) => setEfectivo(Number(e.target.value))}
          />
        </label>
        <label>
          Tarjeta:
          <input
            type="number"
            value={tarjeta}
            onChange={(e) => setTarjeta(Number(e.target.value))}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button onClick={onClose}>Cancelar</button>
        <button onClick={handleConfirm}>Confirmar</button>
      </div>
    </div>
  );
};

export default MetodoPagoModal;
