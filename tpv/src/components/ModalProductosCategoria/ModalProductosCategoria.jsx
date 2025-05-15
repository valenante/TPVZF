import React from "react";
import "./ModalProductosCategoria.css";

const ModalProductosCategoria = ({ categoria, productos, onClose, onProductoClick }) => {
  return (
    <div className="modal-categoria">
      <div className="modal-contenido">
        <h2>{categoria}</h2>
        <ul>
          {productos.map(p => (
            <li key={p._id} onClick={() => onProductoClick(p)}>
              <span>{p.nombre}</span>
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default ModalProductosCategoria;
