import React, { useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import ReactDOM from "react-dom";
import { Trans } from "@lingui/react/macro";
import { toast } from "react-toastify"; // Importar toast
import { useMesas } from "../../context/MesasContext"; // 👈 Importar el hook
import api from "../../utils/api";
import "../../styles/ModalDetalle.css";

const ProductoDetalle = ({ producto, cerrarModal, seleccionPrecio }) => {
  const { numeroMesa } = useMesas(); // 👈 Obtener el número de mesa desde el contexto
  const [cantidad, setCantidad] = useState(1);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([...producto.ingredientes]);
  const [ingredientesEliminados, setIngredientesEliminados] = useState([]);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({});
  const [tipoPlato, setTipoPlato] = useState("compartir"); // Nuevo estado para "compartir" o "individual"
  const [searchParams] = useSearchParams();
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

  const manejarTipoPlato = (e) => {
    setTipoPlato(e.target.value); // Actualizar tipo de plato ("compartir" o "individual")
  };

  const agregarAlCarrito = async () => {

    console.log(producto);

    const pedido = {
      productId: producto._id,
      cantidad,
      ingredientes: ingredientesEliminados, // Solo ingredientes eliminados
      opciones: opcionesSeleccionadas,
      precioSeleccionado: seleccionPrecio, // Asegúrate de incluir este campo
      total: seleccionPrecio * cantidad, // Calcular el total basado en el precio seleccionado
      mesa: numeroMesa,
      nombre,
      tipoPlato: tipoPlato, // Agregar tipo de plato (compartir o individual)
    };

    try {
      const response = await api.post('/cart', {
        mesa: numeroMesa, // 🔹 Enviar `mesa` en la raíz
        items: [pedido],  // 🔹 Enviar el producto dentro de `items`
      });
  
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
      <h2><Trans>{producto.nombre}</Trans></h2>

      <h4><Trans>Ingredientes:</Trans></h4>
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
          <h4><Trans>Opciones:</Trans></h4>
          {producto.opcionesPersonalizables.map((opcion) => (
            <div key={opcion.tipo}>
              <h5><Trans>{opcion.tipo}</Trans></h5>
              {opcion.opciones.map((op) => (
                <label key={op}>
                  <input
                    type="radio"
                    name={opcion.tipo}
                    value={op}
                    checked={opcionesSeleccionadas[opcion.tipo] === op}
                    onChange={() => manejarOpciones(opcion.tipo, op)}
                  />
                  <Trans>{op}</Trans>
                </label>
              ))}
            </div>
          ))}
        </>
      )}

      <h4><Trans>Cantidad:</Trans></h4>
      <div>
        <button className="cantidad-btn" onClick={() => manejarCantidad(-1)}>-</button>
        <span>{cantidad}</span>
        <button className="cantidad-btn" onClick={() => manejarCantidad(1)}>+</button>
      </div>

      {/* Nuevo select para elegir si el plato es para compartir o individual */}
      <h4><Trans>Tipo de plato:</Trans></h4>
      <div className="tipo-plato-select-container-detalle">
        <select value={tipoPlato} onChange={manejarTipoPlato} className="tipo-plato-select-detalle">
          <option value="compartir"><Trans>Compartir</Trans></option>
          <option value="individual"><Trans>Individual</Trans></option>
        </select>
      </div>

      <div>
        <button className="cancelar-btn" onClick={cerrarModal}><Trans>Cancelar</Trans></button>
        <button className="agregar-btn" onClick={agregarAlCarrito}><Trans>Agregar al carrito</Trans></button>
      </div>
    </div>
  </div>,
  document.body
);
};

export default ProductoDetalle;
