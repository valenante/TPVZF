import React from "react";

const ListaBebidas = ({ pedidosBebidas = [], eliminarProducto }) => {
  return (
    <ul className="lista-pedidos--mesadetalles">
      {pedidosBebidas.length > 0 ? (
        pedidosBebidas.map((pedido) => (
          <li key={pedido._id} className="pedido--mesadetalles">
            <ul className="lista-productos--mesadetalles">
              {pedido.productos?.length > 0 ? (
                pedido.productos.map((producto) => {
                  const bebida = producto.producto;
                  const nombre = typeof bebida === "string" ? "" : bebida?.nombre;
                  const productoId =
                    typeof bebida === "string" ? bebida : bebida?._id;

                  return (
                    <li
                      key={productoId}
                      className={`producto--mesadetalles ${
                        producto.estadoPreparacion === "listo"
                          ? "producto-listo"
                          : ""
                      }`}
                    >
                      {nombre
                        ? `${producto.cantidad} ${nombre}`
                        : "Cargando bebida..."}
                      <button
                        className="boton-eliminar--mesadetalles"
                        onClick={() =>
                          eliminarProducto(pedido._id, productoId)
                        }
                      >
                        x
                      </button>
                    </li>
                  );
                })
              ) : (
                <p className="sin-productos--mesadetalles">
                  No hay bebidas en este pedido.
                </p>
              )}
            </ul>
          </li>
        ))
      ) : (
        <p className="sin-pedidos--mesadetalles">
          No hay pedidos de bebidas disponibles.
        </p>
      )}
    </ul>
  );
};

export default ListaBebidas;
