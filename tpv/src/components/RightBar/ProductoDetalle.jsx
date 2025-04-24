import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import api from "../../utils/api";
import "./ProductoDetalle.css";

const ProductoDetalle = ({ producto, cerrarModal, onConfirm, seleccionPrecioInicial }) => {
  const [cantidad, setCantidad] = useState(1);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([...producto.ingredientes]);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({});
  const [acompanante, setAcompanante] = useState("");
  const [acompanantesDisponibles, setAcompanantesDisponibles] = useState([]);
  const [tipoPrecio, setTipoPrecio] = useState("precioBase");
  const [precioSeleccionado, setPrecioSeleccionado] = useState(seleccionPrecioInicial || producto.precios.precioBase);
  const [tipoPlato, setTipoPlato] = useState("compartir");

  const categoriasConAcompanante = [
    "vodka", "ron", "whisky", "ginebra", "gin",
    "licor", "licores", "brandy"
  ];

  useEffect(() => {
    const cargarAcompanantes = async () => {
      try {
        const res = await api.get("/productos");
        const categoriasValidas = ["refrescos", "aguas", "gaseosas", "zumos", "jugos"];
        const filtrados = res.data.filter(
          (p) => p.tipo === "bebida" && categoriasValidas.includes(p.categoria.toLowerCase())
        );
        const nombres = [...new Set(filtrados.map((p) => p.nombre))];
        setAcompanantesDisponibles(nombres);
      } catch (error) {
        console.error("Error al cargar acompañantes:", error);
      }
    };

    cargarAcompanantes();
  }, []);

  const manejarCantidad = (inc) => setCantidad((prev) => Math.max(1, prev + inc));
  const manejarOpciones = (tipo, opcion) => setOpcionesSeleccionadas((prev) => ({ ...prev, [tipo]: opcion }));
  const manejarIngrediente = (ing, sel) => {
    setIngredientesSeleccionados((prev) =>
      sel ? [...prev, ing] : prev.filter((i) => i !== ing)
    );
  };

  const confirmarProducto = () => {
    const productoPersonalizado = {
      ...producto,
      cantidad,
      precioSeleccionado,
      tipoPrecio,
      tipoPlato,
      acompanante,
      opciones: opcionesSeleccionadas,
      ingredientes: producto.ingredientes.filter((i) => !ingredientesSeleccionados.includes(i))
    };
    onConfirm(productoPersonalizado);
  };

  return ReactDOM.createPortal(
    <div className="modal-detalle--productoDetalle">
      <div className="modal-contenido--productoDetalle">
        <h2 className="titulo-modal--productoDetalle">Personaliza tu {producto.nombre}</h2>
        <p className="descripcion--productoDetalle">{producto.descripcion}</p>

        <h4>Ingredientes:</h4>
        <ul className="lista-ingredientes--productoDetalle">
          {producto.ingredientes.map((ing) => (
            <li key={ing} className="ingrediente--productoDetalle">
              <label>
                <input
                  type="checkbox"
                  checked={ingredientesSeleccionados.includes(ing)}
                  onChange={(e) => manejarIngrediente(ing, e.target.checked)}
                />
                {ing}
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
          <button onClick={() => manejarCantidad(-1)}>-</button>
          <span>{cantidad}</span>
          <button onClick={() => manejarCantidad(1)}>+</button>
        </div>

        {(producto.precios.tapa !== null || producto.precios.racion !== null || producto.precios.surtido !== null) && (
          <>
            <h4>Tipo de precio:</h4>
            <select
              value={tipoPrecio}
              onChange={(e) => {
                const tipo = e.target.value;
                setTipoPrecio(tipo);
                if (tipo === "tapa") setPrecioSeleccionado(producto.precios.tapa);
                if (tipo === "racion") setPrecioSeleccionado(producto.precios.racion);
                if (tipo === "surtido") setPrecioSeleccionado(producto.precios.surtido);
                if (tipo === "precioBase") setPrecioSeleccionado(producto.precios.precioBase);
              }}
            >
              {producto.precios.tapa !== null && <option value="tapa">Tapa - {producto.precios.tapa} €</option>}
              {producto.precios.racion !== null && <option value="racion">Ración - {producto.precios.racion} €</option>}
              {producto.precios.surtido !== null && <option value="surtido">Surtido - {producto.precios.surtido} €</option>}
              {producto.precios.precioBase !== null && <option value="precioBase">{producto.precios.precioBase} €</option>}
            </select>
          </>
        )}

        <h4>Tipo de plato:</h4>
        <select value={tipoPlato} onChange={(e) => setTipoPlato(e.target.value)}>
          <option value="compartir">Compartir</option>
          <option value="individual">Individual</option>
        </select>

        {producto.tipo === "bebida" && categoriasConAcompanante.includes(producto.categoria.toLowerCase()) && (
          <>
            <h4>Acompañante:</h4>
            <select
              value={acompanante}
              onChange={(e) => setAcompanante(e.target.value)}
            >
              <option value="">Selecciona un acompañante</option>
              {acompanantesDisponibles.map((nombre) => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
              <option value="Sin acompañante">Sin acompañante</option>
            </select>
          </>
        )}

        <div className="modal-botones--productoDetalle">
          <button onClick={cerrarModal}>Cancelar</button>
          <button onClick={confirmarProducto}>Agregar</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductoDetalle;
