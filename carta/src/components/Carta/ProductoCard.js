import React, { useState } from "react";
import ProductoDetalle from "./ProductoDetalle";
import "../../styles/ProductoCard.css";

const ProductoCard = ({ producto, estrellas }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [seleccionPrecio, setSeleccionPrecio] = useState(
    producto.precios.tapa !== null && producto.precios.tapa >= 0
      ? producto.precios.tapa
      : producto.precios.precioBase
  );

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  return (
    <div className="producto-card-prodCard">
      <div className="producto-card-content-prodCard">
        <div className="producto-info-prodCard">
          <h3>{producto.nombre}</h3>
          <p>{producto.descripcion}</p>
          <p>
            <strong>Valoración:</strong>{" "}
            {estrellas ? `${estrellas} estrellas` : "Sin valoraciones"}
          </p>
          <span>
            {producto.tipo === "tapaRacion" ? (
              <select value={seleccionPrecio} onChange={(e) => setSeleccionPrecio(Number(e.target.value))}>
                {producto.precios.tapa !== null && (
                  <option value={producto.precios.tapa}>
                    Tapa - {producto.precios.tapa} €
                  </option>
                )}
                {producto.precios.racion !== null && (
                  <option value={producto.precios.racion}>
                    Ración - {producto.precios.racion} €
                  </option>
                )}
              </select>
            ) : (
              `${producto.precios.precioBase} €`
            )}
          </span>
          <button onClick={abrirModal} className="agregar-carrito-btn-prodCard">
            Agregar al carrito
          </button>
        </div>
        <div className="producto-img-container-prodCard">
          <img src={producto.img} alt={producto.nombre} />
        </div>
      </div>

      {mostrarModal && (
        <ProductoDetalle
          producto={producto}
          cerrarModal={cerrarModal}
          seleccionPrecio={seleccionPrecio}
        />
      )}
    </div>
  );
};

export default ProductoCard;
