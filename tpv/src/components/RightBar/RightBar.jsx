import React, { useState, useEffect } from "react";
import ProductoDetalle from "./ProductoDetalle.jsx";
import { useCategorias } from "../../context/CategoriasContext";
import "./RightBar.css";

const RightBar = ({ mesaId, agregarProducto }) => {
  const [tipo, setTipo] = useState("plato"); // Tipo seleccionado: "plato" o "bebida"
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [preciosSeleccionados, setPreciosSeleccionados] = useState({}); // Mapeo de productoId -> precioSeleccionado
  const [showModal, setShowModal] = useState(false);
  const { categories, fetchCategories, products, fetchProducts } = useCategorias();

  useEffect(() => {
    // Obtener categorías cuando cambia el tipo
    fetchCategories(tipo);
  }, [tipo]);

  useEffect(() => {
    // Obtener productos cuando cambia la categoría seleccionada
    if (categoriaSeleccionada) {
      fetchProducts(categoriaSeleccionada);
    }
  }, [categoriaSeleccionada]);

  const abrirModal = (producto) => {
    const precioSeleccionado =
      preciosSeleccionados[producto._id] !== undefined
        ? preciosSeleccionados[producto._id] // Usar el precio seleccionado si existe
        : producto.tipo === "tapaRacion"
          ? producto.precios.tapa || producto.precios.racion // Precio inicial para tapa/ración
          : producto.precios.precioBase; // Precio base para otros tipos

    setProductoSeleccionado({ ...producto, precioSeleccionado });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setProductoSeleccionado(null);
    setShowModal(false);
  };

  return (
    <div className="right-bar--rightbar">
      <div className="filtros-tipo--rightbar">
        <button
          onClick={() => setTipo("plato")}
          className={`boton-tipo--rightbar ${tipo === "plato" ? "activo--rightbar" : ""}`}
        >
          Platos
        </button>
        <button
          onClick={() => setTipo("bebida")}
          className={`boton-tipo--rightbar ${tipo === "bebida" ? "activo--rightbar" : ""}`}
        >
          Bebidas
        </button>
      </div>

      <div className="categorias--rightbar">
        <ul className="lista-categorias--rightbar">
          {categories.map((categoria) => (
            <li
              key={categoria}
              className={`categoria--rightbar ${categoria === categoriaSeleccionada ? "seleccionada--rightbar" : ""}`}
              onClick={() => setCategoriaSeleccionada(categoria)}
            >
              {categoria}
            </li>
          ))}
        </ul>
      </div>

      <div className="productos--rightbar">
        <h4 className="titulo-productos--rightbar">Productos</h4>
        <ul className="lista-productos--rightbar">
          {products.map((producto) => (
            <li key={producto._id} className="producto--rightbar">
              {/* Info del producto + precio para desktop */}
              <div className="acciones-desktop--rightbar">
                <div className="producto-info--rightbar">
                  {producto.nombre}
                </div>
                <button onClick={() => abrirModal(producto)} className="boton-agregar--rightbar">
                  Agregar
                </button>
              </div>

              {/* Versión móvil */}
              <div className="acciones-mobile--rightbar">
                <div className="producto-info--rightbar">{producto.nombre}</div>
                <button onClick={() => abrirModal(producto)} className="boton-agregar--rightbar">
                  Agregar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showModal && productoSeleccionado && (
        <ProductoDetalle
          producto={productoSeleccionado}
          cerrarModal={cerrarModal}
          seleccionPrecio={productoSeleccionado.precioSeleccionado}
          onConfirm={(productoPersonalizado) => {
            agregarProducto(productoPersonalizado);
            cerrarModal();
          }}
        />
      )}
    </div>
  );
};

export default RightBar;
