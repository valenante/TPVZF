import React, { useState } from "react";
import { Trans } from "@lingui/react";
import { useLingui } from "@lingui/react";
import ProductoDetalle from "./ProductoDetalle";
import "../../styles/ProductoCard.css";

const ProductoCard = ({ producto, estrellas }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [seleccionPrecio, setSeleccionPrecio] = useState(
    producto.precios.tapa !== null && producto.precios.tapa >= 0
      ? producto.precios.tapa
      : producto.precios.precioBase
  );
  const { i18n } = useLingui(); // Obtener el idioma actual

  // Obtener el idioma actual
  const idiomaActual = i18n.locale;

  // Verificar si hay una traducción disponible en el idioma actual
  const nombreTraducido = producto.traducciones?.[idiomaActual]?.nombre || producto.nombre;
  const descripcionTraducida = producto.traducciones?.[idiomaActual]?.descripcion || producto.descripcion;


  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  return (
    <div className="producto-card-prodCard">
      <div className="producto-card-content-prodCard">
        <div className="producto-info-prodCard">
          <h3>{nombreTraducido}</h3>
          <p>{descripcionTraducida}</p>
          <p>
            <strong>
              <Trans id="valoracion">Valoración:</Trans>
            </strong>{" "}
            {estrellas ? (
              <>
                {estrellas} <Trans id="estrellas">estrellas</Trans>
              </>
            ) : (
              <Trans id="sin-valoraciones">Sin valoraciones</Trans>
            )}
          </p>
          <span>
            {producto.precios.tapa !== null && producto.precios.racion !== null ? (
              <select value={seleccionPrecio} onChange={(e) => setSeleccionPrecio(Number(e.target.value))}>
                {producto.precios.tapa !== null && (
                  <option value={producto.precios.tapa}>
                    <Trans id="tapa">Tapa</Trans> - {producto.precios.tapa} €
                  </option>
                )}
                {producto.precios.racion !== null && (
                  <option value={producto.precios.racion}>
                    <Trans id="racion">Ración</Trans> - {producto.precios.racion} €
                  </option>
                )}
              </select>
            ) : (
              `${producto.precios.precioBase} €`
            )}
          </span>
          <button onClick={abrirModal} className="agregar-carrito-btn-prodCard">
            <Trans id="agregar-carrito">Agregar al carrito</Trans>
          </button>
        </div>
        {producto.img && (
          <div className="producto-img-container-prodCard">
            <img alt={producto.nombre} src={producto.img} style={{ width: "200px", height: "auto" }} />
          </div>
        )}
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
