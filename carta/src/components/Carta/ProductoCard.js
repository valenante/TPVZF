import React, { useState, useEffect } from "react";
import { Trans } from "@lingui/react";
import { useLingui } from "@lingui/react";
import ProductoDetalle from "./ProductoDetalle";
import ModalCroquetas from "./ModalCroquetas"; // Componente modal para croquetas
import "../../styles/ProductoCard.css";

const ProductoCard = ({ producto, estrellas }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [pantallaPequena, setPantallaPequena] = useState(window.innerWidth <= 768);
  const [seleccionPrecio, setSeleccionPrecio] = useState(
    producto.precios.tapa !== null && producto.precios.tapa >= 0
      ? producto.precios.tapa
      : producto.precios.precioBase
  );

  const [tipoPrecio, setTipoPrecio] = useState(
    producto.precios.tapa !== null && producto.precios.tapa >= 0
      ? "tapa"
      : producto.precios.racion !== null && producto.precios.racion >= 0
        ? "racion"
        : "surtido"
  );

  const { i18n } = useLingui();
  const idiomaActual = i18n.locale;
  const nombreTraducido = producto.traducciones?.[idiomaActual]?.nombre || producto.nombre;
  const descripcionTraducida = producto.traducciones?.[idiomaActual]?.descripcion || producto.descripcion;
  const esCroqueta = producto.nombre.toLowerCase().includes("croqueta") && !producto.nombre.toLowerCase().includes("mexicanas");

  useEffect(() => {
    const handleResize = () => {
      setPantallaPequena(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  // Función para manejar el cambio de selección de precio
  const manejarCambioPrecio = (e) => {
    const precioSeleccionado = Number(e.target.value);
    setSeleccionPrecio(precioSeleccionado);
    // Actualizamos tipo de precio con la opción seleccionada
    if (precioSeleccionado === producto.precios.tapa) {
      setTipoPrecio("tapa");
    } else if (precioSeleccionado === producto.precios.racion) {
      setTipoPrecio("racion");
    } else if (precioSeleccionado === producto.precios.surtido) {
      setTipoPrecio("surtido");
    }
  };

  return (
    <div className="producto-card-prodCard">
      {pantallaPequena ? (
        <div className="producto-grid-pequeno">
          <h3 className="producto-nombre">{nombreTraducido}</h3>

          <div className="producto-info-grid">
            <p className="producto-descripcion">{descripcionTraducida}</p>
            {producto.img && (
              <div className="producto-img-container">
                <img alt={producto.nombre} src={producto.img} />
              </div>
            )}
          </div>

          <div className="producto-precio-boton">
            <span className="producto-precio">
              {producto.precios.tapa !== null || producto.precios.racion !== null || producto.precios.surtido !== null ? (
                <select value={seleccionPrecio} onChange={manejarCambioPrecio}>
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
                  {typeof producto.precios.surtido === "number" && !isNaN(producto.precios.surtido) && (
                    <option value={producto.precios.surtido}>
                      <Trans id="surtido">Surtido</Trans> - {producto.precios.surtido} €
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
        </div>
      ) : (
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
              {producto.precios.tapa !== null || producto.precios.racion !== null || producto.precios.surtido !== null ? (
                <select value={seleccionPrecio} onChange={manejarCambioPrecio}>
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
                  {producto.precios.surtido !== null && (
                    <option value={producto.precios.surtido}>
                      <Trans id="surtido">Surtido</Trans> - {producto.precios.surtido} €
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
              <img alt={producto.nombre} src={producto.img} />
            </div>
          )}
        </div>
      )}

      {/* Renderiza el modal de croquetas o detalles normales */}
      {mostrarModal && esCroqueta ? (
        <ModalCroquetas
          producto={producto}
          cerrarModal={cerrarModal}
          seleccionPrecio={seleccionPrecio}
          tipoPrecio={tipoPrecio} // Pasamos el tipo de plato
        />) : (
        mostrarModal && <ProductoDetalle producto={producto} cerrarModal={cerrarModal} seleccionPrecio={seleccionPrecio} />
      )}
    </div>
  );
};

export default ProductoCard;
