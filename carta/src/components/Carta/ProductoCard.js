import React, { useState, useEffect } from "react";
import { useMesas } from "../../context/MesasContext";
import { Trans } from "@lingui/react";
import { useLingui } from "@lingui/react";
import ProductoDetalle from "./ProductoDetalle";
import ModalCroquetas from "./ModalCroquetas"; // Componente modal para croquetas
import "../../styles/ProductoCard.css";

const ProductoCard = ({ producto, estrellas }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const { numeroMesa } = useMesas();
  const BASE_URL = process.env.REACT_APP_SOCKET_URL;
  const [pantallaPequena, setPantallaPequena] = useState(window.innerWidth <= 768);
  const [tipoPrecio, setTipoPrecio] = useState(
    producto.precios.tapa != null
      ? "tapa"
      : producto.precios.racion != null
      ? "racion"
      : producto.precios.copa != null
      ? "copa"
      : producto.precios.botella != null
      ? "botella"
      : "precioBase"
  );
  const [seleccionPrecio, setSeleccionPrecio] = useState(
    producto.precios?.[tipoPrecio] ?? producto.precios?.precioBase
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

  const renderPrecio = () => {
    if (numeroMesa) return null;

    const precios = producto.precios || {};
    const opciones = [];

    if (precios.tapa != null) opciones.push({ key: "tapa", label: `Tapa - ${precios.tapa} €` });
    if (precios.racion != null) opciones.push({ key: "racion", label: `Ración - ${precios.racion} €` });
    if (precios.copa != null) opciones.push({ key: "copa", label: `Copa - ${precios.copa} €` });
    if (precios.botella != null) opciones.push({ key: "botella", label: `Botella - ${precios.botella} €` });

    if (opciones.length > 0) {
      return (
        <select
          value={tipoPrecio}
          onChange={(e) => {
            setTipoPrecio(e.target.value);
            setSeleccionPrecio(precios[e.target.value]);
          }}
        >
          {opciones.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <p className="producto-precio">
        {precios.precioBase ?? "No disponible"} €
      </p>
    );
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
                <img
                  alt={producto.nombre}
                  src={`${BASE_URL}${producto.img}`}
                  loading="lazy"
                />
              </div>
            )}
          </div>
  
          <div className="producto-precio-boton">
            {renderPrecio()}
            {numeroMesa && (
              <button onClick={abrirModal} className="agregar-carrito-btn-prodCard">
                <Trans id="agregar-carrito">Agregar al carrito</Trans>
              </button>
            )}
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
            <div className="producto-precio-boton">{renderPrecio()}</div>
            {numeroMesa && (
              <button onClick={abrirModal} className="agregar-carrito-btn-prodCard">
                <Trans id="agregar-carrito">Agregar al carrito</Trans>
              </button>
            )}
          </div>
          {producto.img && (
            <div className="producto-img-container-prodCard">
              <img
                alt={producto.nombre}
                src={`${BASE_URL}${producto.img}`}
                loading="lazy"
              />
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
          tipoPrecio={tipoPrecio}
        />
      ) : (
        mostrarModal && (
          <ProductoDetalle producto={producto} cerrarModal={cerrarModal} />
        )
      )}
    </div>
  );
};  

export default ProductoCard;
