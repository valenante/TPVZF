import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import api from "../../utils/api";
import "./ProductoDetalle.css";

const ProductoDetalle = ({
  producto,
  cerrarModal,
  onConfirm,
  seleccionPrecioInicial,
}) => {
  const [cantidad, setCantidad] = useState(1);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([
    ...producto.ingredientes,
  ]);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({});
  const [acompanante, setAcompanante] = useState("");
  const [acompanantesDisponibles, setAcompanantesDisponibles] = useState([]);
  const [tipoPrecio, setTipoPrecio] = useState(
    producto.tipoPrecio || "precioBase"
  );
  const [precioSeleccionado, setPrecioSeleccionado] = useState(() => {
    const inicial =
      typeof seleccionPrecioInicial === "number"
        ? seleccionPrecioInicial
        : producto.precios[producto.tipoPrecio || "precioBase"];
    return typeof inicial === "number" && !isNaN(inicial) ? inicial : 0;
  });

  const [tipoPlato, setTipoPlato] = useState("compartir");
  const categoriasConAcompanante = [
    "vodka",
    "ron",
    "whisky",
    "ginebra",
    "gin",
    "licor",
    "licores",
    "brandy",
  ];

  useEffect(() => {
    let initialTipo = "precioBase";
    let initialPrecio = 0;

    if (producto.categoria.toLowerCase().includes("vino")) {
      if (producto.precios.copa !== null && producto.precios.copa >= 0) {
        initialTipo = "copa";
        initialPrecio = producto.precios.copa;
      } else if (
        producto.precios.botella !== null &&
        producto.precios.botella >= 0
      ) {
        initialTipo = "botella";
        initialPrecio = producto.precios.botella;
      }
    } else {
      const precios = producto.precios;
      const prioridades = ["tapa", "racion", "surtido", "precioBase"];
      for (let key of prioridades) {
        if (precios[key] !== null && precios[key] >= 0) {
          initialTipo = key;
          initialPrecio = precios[key];
          break;
        }
      }
    }

    setTipoPrecio(initialTipo);
    setPrecioSeleccionado(initialPrecio);
  }, [producto]);

  useEffect(() => {
    // Actualiza el precio seleccionado cada vez que cambia el tipoPrecio
    const precio = producto.precios[tipoPrecio];
    if (typeof precio === "number" && !isNaN(precio)) {
      setPrecioSeleccionado(precio);
    }
  }, [tipoPrecio, producto.precios]);

  useEffect(() => {
    const cargarAcompanantes = async () => {
      try {
        const res = await api.get("/productos");
        const categoriasValidas = [
          "refrescos",
          "aguas",
          "gaseosas",
          "zumos",
          "jugos",
        ];
        const filtrados = res.data.filter(
          (p) =>
            p.tipo === "bebida" &&
            categoriasValidas.includes(p.categoria.toLowerCase())
        );
        const nombres = [...new Set(filtrados.map((p) => p.nombre))];
        setAcompanantesDisponibles(nombres);
      } catch (error) {
        console.error("Error al cargar acompañantes:", error);
      }
    };

    cargarAcompanantes();
  }, []);

  const manejarCantidad = (inc) =>
    setCantidad((prev) => Math.max(1, prev + inc));
  const manejarOpciones = (tipo, opcion) =>
    setOpcionesSeleccionadas((prev) => ({ ...prev, [tipo]: opcion }));
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
      ingredientes: producto.ingredientes.filter(
        (i) => !ingredientesSeleccionados.includes(i)
      ),
    };
    onConfirm(productoPersonalizado);
  };

  console.log(precioSeleccionado);

  return ReactDOM.createPortal(
    <div className="modal-detalle--productoDetalle">
      <div className="modal-contenido--productoDetalle">
        <h2 className="titulo-modal--productoDetalle">
          Personaliza tu {producto.nombre}
        </h2>
        <p className="descripcion--productoDetalle">{producto.descripcion}</p>

        {producto.ingredientes.length > 0 && (
          <>
            <h4>Ingredientes:</h4>
            <ul className="lista-ingredientes--productoDetalle">
              {producto.ingredientes.map((ing) => (
                <li key={ing} className="ingrediente--productoDetalle">
                  <label>
                    <input
                      type="checkbox"
                      checked={ingredientesSeleccionados.includes(ing)}
                      onChange={(e) =>
                        manejarIngrediente(ing, e.target.checked)
                      }
                    />
                    {ing}
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

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

        {producto.categoria.toLowerCase().includes("vino") ? (
          <>
            <h4>Tipo de presentación:</h4>
            <select
              value={tipoPrecio}
              onChange={(e) => setTipoPrecio(e.target.value)}
            >
              {producto.precios.copa !== null && (
                <option value="copa">Copa - {producto.precios.copa} €</option>
              )}
              {producto.precios.botella !== null && (
                <option value="botella">
                  Botella - {producto.precios.botella} €
                </option>
              )}
            </select>
          </>
        ) : (
          Object.entries(producto.precios).some(
            ([_, val]) => typeof val === "number"
          ) && (
            <>
              <h4>Tipo de precio:</h4>
              <select
                value={tipoPrecio}
                onChange={(e) => setTipoPrecio(e.target.value)}
              >
                {Object.entries(producto.precios).map(([key, val]) => {
                  if (typeof val === "number") {
                    return (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} - {val} €
                      </option>
                    );
                  }
                  return null;
                })}
              </select>
            </>
          )
        )}

        <h4>Tipo de plato:</h4>
        <select
          value={tipoPlato}
          onChange={(e) => setTipoPlato(e.target.value)}
        >
          <option value="compartir">Compartir</option>
          <option value="individual">Individual</option>
        </select>

        {producto.tipo === "bebida" &&
          categoriasConAcompanante.includes(
            producto.categoria.toLowerCase()
          ) && (
            <>
              <h4>Acompañante:</h4>
              <select
                value={acompanante}
                onChange={(e) => setAcompanante(e.target.value)}
              >
                <option value="">Selecciona un acompañante</option>
                {acompanantesDisponibles.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
                <option value="Sin acompañante">Sin acompañante</option>
              </select>
            </>
          )}

        <div className="modal-botones--productoDetalle">
          <button
            className="boton-cancelar--productoDetalle"
            onClick={cerrarModal}
          >
            Cancelar
          </button>
          <button
            className="boton-agregar--productoDetalle"
            onClick={confirmarProducto}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductoDetalle;
