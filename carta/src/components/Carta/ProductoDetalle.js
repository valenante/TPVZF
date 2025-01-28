import React, { useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import ReactDOM from "react-dom";
import { toast } from "react-toastify"; // Importar toast
import api from "../../utils/api";
import "../../styles/ModalDetalle.css";

const ProductoDetalle = ({ producto, cerrarModal, seleccionPrecio }) => {
  const [cantidad, setCantidad] = useState(1);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([...producto.ingredientes]);
  const [ingredientesEliminados, setIngredientesEliminados] = useState([]);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({});
  const [searchParams] = useSearchParams();
  const { numeroMesa } = useParams();
  const mesa = numeroMesa;
  const nombre = searchParams.get("nombre");

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

    const cartId = carritoId;

    const pedido = {
      cartId,
      productId: producto._id,
      cantidad,
      ingredientes: ingredientesEliminados, // Solo ingredientes eliminados
      opciones: opcionesSeleccionadas,
      precioSeleccionado: seleccionPrecio, // Asegúrate de incluir este campo
      total: seleccionPrecio * cantidad, // Calcular el total basado en el precio seleccionado
      mesa,
      nombre,
    };

    try {
      const response = await api.post('/cart', pedido);
      const { _id: nuevoCartId } = response.data;

      if (!carritoId) {
        localStorage.setItem('carritoMongoId', nuevoCartId);
      }

       // Mostrar notificación de éxito
       toast.success("Producto agregado al carrito con éxito!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      cerrarModal();
    } catch (error) {

      // Mostrar notificación de error
      toast.error("Error al agregar al carrito. Intenta nuevamente.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      
      console.error('Error al agregar al carrito:', error);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-detalle">
      <div className="modal-contenido-detalle">
        <h2>Personaliza tu {producto.nombre}</h2>
        <p>{producto.descripcion}</p>

        <h4>Ingredientes:</h4>
        <ul>
          {producto.ingredientes.map((ingrediente) => (
            <li key={ingrediente}>
              <label>
                <input
                  type="checkbox"
                  className="checkbox-detalle"
                  checked={ingredientesSeleccionados.includes(ingrediente)}
                  onChange={(e) => manejarIngrediente(ingrediente, e.target.checked)}
                />
                {ingrediente}
              </label>
            </li>
          ))}
        </ul>

        {producto.opcionesPersonalizables.length > 0 && (
          <>
            <h4>Opciones:</h4>
            {producto.opcionesPersonalizables.map((opcion) => (
              <div key={opcion.tipo}>
                <h5>{opcion.tipo}</h5>
                {opcion.opciones.map((op) => (
                  <label key={op}>
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

        <h4>Cantidad:</h4>
        <div>
          <button className="cantidad-btn" onClick={() => manejarCantidad(-1)}>-</button>
          <span>{cantidad}</span>
          <button className="cantidad-btn" onClick={() => manejarCantidad(1)}>+</button>
        </div>

        <div>
          <button className="cancelar-btn" onClick={cerrarModal}>Cancelar</button>
          <button className="agregar-btn" onClick={agregarAlCarrito}>Agregar al carrito</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductoDetalle;
