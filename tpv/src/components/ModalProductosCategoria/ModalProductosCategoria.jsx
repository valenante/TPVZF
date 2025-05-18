import React from "react";
import "./ModalProductosCategoria.css";

const ModalProductosCategoria = ({ categoria, productos, onClose, onProductoClick, productosPedidoMesa = [] }) => {
const contarPedidos = (productoId) => {
  const coincidencias = productosPedidoMesa.filter(p => {
    const idProducto = p.producto?._id?.toString() || p._id?.toString();
    return idProducto === productoId;
  });
  const cantidad = coincidencias.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  return cantidad;
};

  return (
    <div className="modal-categoria">
      <div className="modal-contenido">
        <h2>{categoria}</h2>
        <ul>
          {productos.map(p => {
            const cantidadPedido = contarPedidos(p._id?.toString());

            return (
              <li key={p._id} onClick={() => onProductoClick(p)} className="producto-item">
                <span>{p.nombre}</span>
                {cantidadPedido > 0 && (
                  <span className="contador-pedido">{cantidadPedido}</span>
                )}
              </li>
            );
          })}
        </ul>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default ModalProductosCategoria;
