import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./ProductoDetalle.css";

const ProductoDetalle = ({ producto, cerrarModal, onConfirm, seleccionPrecio }) => {
  const [cantidad, setCantidad] = useState(1);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([...producto.ingredientes]);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({});

  console.log(seleccionPrecio);

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
    } else {
      setIngredientesSeleccionados((prev) => prev.filter((ing) => ing !== ingrediente));
    }
  };

  const confirmarProducto = () => {
    const productoPersonalizado = {
      ...producto,
      total: producto.precios.precioBase,
      cantidad,
      ingredientesEliminados: producto.ingredientes.filter((ing) => !ingredientesSeleccionados.includes(ing)),
      opciones: opcionesSeleccionadas,
      precioSeleccionado: seleccionPrecio, // Asegúrate de incluir este campo
    };
    onConfirm(productoPersonalizado);
  };

  return ReactDOM.createPortal(
    <div className="modal-detalle--productoDetalle">
      <div className="modal-contenido--productoDetalle">
        <h2 className="titulo-modal--productoDetalle">Personaliza tu {producto.nombre}</h2>
        <p className="descripcion--productoDetalle">{producto.descripcion}</p>

        {/* Ingredientes */}
        <h4 className="subtitulo--productoDetalle">Ingredientes:</h4>
        <ul className="lista-ingredientes--productoDetalle">
          {producto.ingredientes.map((ingrediente) => (
            <li key={ingrediente} className="ingrediente--productoDetalle">
              <label>
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

        {/* Opciones */}
        {producto.opcionesPersonalizables.length > 0 && (
          <>
            <h4 className="subtitulo--productoDetalle">Opciones:</h4>
            {producto.opcionesPersonalizables.map((opcion) => (
              <div key={opcion.tipo} className="opcion--productoDetalle">
                <h5 className="tipo-opcion--productoDetalle">{opcion.tipo}</h5>
                {opcion.opciones.map((op) => (
                  <label key={op} className="opcion-label--productoDetalle">
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
        <h4 className="subtitulo--productoDetalle">Cantidad:</h4>
        <div className="cantidad--productoDetalle">
          <button onClick={() => manejarCantidad(-1)} className="boton-cantidad--productoDetalle">-</button>
          <span className="cantidad-valor--productoDetalle">{cantidad}</span>
          <button onClick={() => manejarCantidad(1)} className="boton-cantidad--productoDetalle">+</button>
        </div>

        {/* Botones */}
        <div className="modal-botones--productoDetalle">
          <button onClick={cerrarModal} className="boton-cancelar--productoDetalle">Cancelar</button>
          <button onClick={confirmarProducto} className="boton-agregar--productoDetalle">Agregar</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductoDetalle;
