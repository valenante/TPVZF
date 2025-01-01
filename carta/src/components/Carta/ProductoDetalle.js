import api from '../../utils/api'; // Importar la configuración de Axios desde utils/api.js
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../../styles/ModalDetalle.css';

const ProductoDetalle = ({ producto, cerrarModal }) => {
  const [cantidad, setCantidad] = useState(1);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([...producto.ingredientes]);
  const [ingredientesEliminados, setIngredientesEliminados] = useState([]);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({});

  const manejarCantidad = (incremento) => {
    setCantidad((prev) => Math.max(1, prev + incremento));
  };

  const manejarOpciones = (tipo, opcion) => {
    setOpcionesSeleccionadas((prev) => ({
      ...prev,
      [tipo]: opcion,
    }));
  };

  const manejarIngrediente = (ingrediente, seleccionado) => {
    if (seleccionado) {
      setIngredientesSeleccionados((prev) => [...prev, ingrediente]);
      setIngredientesEliminados((prev) => prev.filter((ing) => ing !== ingrediente));
    } else {
      setIngredientesSeleccionados((prev) => prev.filter((ing) => ing !== ingrediente));
      setIngredientesEliminados((prev) => [...prev, ingrediente]);
    }
  };

  const agregarAlCarrito = async () => {
    const carritoId = localStorage.getItem('carritoMongoId');

    // Preparar el objeto del pedido
    const pedido = {
      productId: producto._id, // Asegúrate de que esto tenga el `_id` del producto
      cantidad,
      ingredientes: ingredientesSeleccionados.filter((ing) => !producto.ingredientes.includes(ing)), // Solo ingredientes eliminados
      opciones: opcionesSeleccionadas,
      cartId: carritoId, // Identificador del carrito
    };

    try {
    const response = await api.post('/cart', pedido);
    const { _id: nuevoCartId } = response.data;

    if (!carritoId) {
      // Guardar el nuevo `cartId` en el local storage
      localStorage.setItem('carritoMongoId', nuevoCartId);
    }
    cerrarModal();
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
  }
};


  return ReactDOM.createPortal(
    <div className="modal-detalle">
      <div className="modal-contenido-detalle">
        <h2>Personaliza tu {producto.nombre}</h2>
        <p>{producto.descripcion}</p>

        {/* Ingredientes */}
        <h4>Ingredientes:</h4>
        <ul>
          {producto.ingredientes.map((ingrediente) => (
            <li key={ingrediente}>
              <label className='ingrediente-label-detalle'>
                <input
                  type="checkbox"
                  checked={ingredientesSeleccionados.includes(ingrediente)}
                  onChange={(e) => manejarIngrediente(ingrediente, e.target.checked)}
                />
                {ingrediente}
              </label>
            </li>
          ))}
        </ul>

        {/* Opciones personalizables */}
        {producto.opcionesPersonalizables.length > 0 && (
          <>
            <h4>Opciones:</h4>
            {producto.opcionesPersonalizables.map((opcion) => (
              <div key={opcion.tipo}>
                <h5>{opcion.tipo}</h5>
                {opcion.opciones.map((op) => (
                  <label className='ingrediente-label-detalle' key={op}>
                    <input
                      type="radio"
                      name={opcion.tipo}
                      value={op}
                      checked={opcionesSeleccionadas[opcion.tipo] === op}
                      onChange={() => manejarOpciones(opcion.tipo, op)}
                    />
                    {op}
                  </label>
                ))}
              </div>
            ))}
          </>
        )}

        {/* Cantidad */}
        <h4>Cantidad:</h4>
        <div className="cantidad-detalle">
          <button onClick={() => manejarCantidad(-1)}>-</button>
          <span>{cantidad}</span>
          <button onClick={() => manejarCantidad(1)}>+</button>
        </div>

        {/* Botones */}
        <div className="modal-botones-detalle">
          <button onClick={cerrarModal}>Cancelar</button>
          <button onClick={agregarAlCarrito}>Agregar al carrito</button>
        </div>
      </div>
    </div>,
    document.body // Renderiza el modal en el cuerpo del documento
  );
};

export default ProductoDetalle;