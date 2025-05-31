import React from "react";

const ListaPedidos = ({ pedidos, productosDetalles, eliminarProducto }) => {
  return (
    <ul className="lista-pedidos--mesadetalles">
      {pedidos.length > 0 ? (
        pedidos.map((pedido) => (
          <li key={pedido._id} className="pedido--mesadetalles">
            <ul className="lista-productos--mesadetalles">
              {pedido.productos.map((producto) => {
                const productoId =
                  typeof producto.producto === "string"
                    ? producto.producto
                    : producto.producto?._id;
                const detalle = productosDetalles[productoId];

                return (
                  <li
                    key={productoId}
                    className={`producto--mesadetalles ${
                      producto.estadoPreparacion === "listo"
                        ? "producto-listo"
                        : ""
                    }`}
                  >
                    {detalle
                      ? `${producto.cantidad} ${detalle.nombre}`
                      : "Cargando producto..."}
                    <button
                      className="boton-eliminar--mesadetalles"
                      onClick={() => eliminarProducto(pedido._id, productoId)}
                    >
                      x
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))
      ) : (
        <p className="sin-pedidos--mesadetalles">No hay pedidos.</p>
      )}
    </ul>
  );
};

export default ListaPedidos;
