import React, { useState } from 'react';
import ProductoDetalle from './ProductoDetalle';
import '../../styles/ProductoCard.css';

const ProductoCard = ({ producto }) => {
  const [mostrarModal, setMostrarModal] = useState(false); // Estado para manejar el modal

  // Verificar si el producto está habilitado
  if (producto.estado !== 'habilitado') {
    return null; // No renderizar si el producto no está habilitado
  }

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  return (
    <div className="producto-card-prodCard">
      <div className="producto-card-content-prodCard">
        {/* Columna izquierda: Nombre y descripción */}
        <div className="producto-info-prodCard">
          <h3>{producto.nombre}</h3>
          <p>{producto.descripcion}</p>
          <span>{producto.precios.precioBase} €</span>
          <button onClick={abrirModal} className="agregar-carrito-btn-prodCard">
            Agregar al carrito
          </button>
        </div>

        {/* Columna derecha: Imagen */}
        <div className="producto-img-container-prodCard">
          <img src={producto.img} alt={producto.nombre} />
        </div>
      </div>

      {mostrarModal && (
        <ProductoDetalle
          producto={producto}
          cerrarModal={cerrarModal}
        />
      )}
    </div>
  );
};

export default ProductoCard;
