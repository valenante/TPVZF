import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Trans } from "@lingui/react/macro";
import { toast } from "react-toastify"; // Importar toast
import { useMesas } from "../../context/MesasContext"; // 👈 Importar el hook
import { useComensal } from "../../context/ComensalesContext"; // 👈 Importar el hook
import api from "../../utils/api";
import "../../styles/ModalDetalle.css";

const ProductoDetalle = ({ producto, cerrarModal }) => {
  const { numeroMesa } = useMesas(); // 👈 Obtener el número de mesa desde el contexto
  const [cantidad, setCantidad] = useState(1);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([
    ...producto.ingredientes,
  ]);
  const [ingredientesEliminados, setIngredientesEliminados] = useState([]);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({});
  const [tipoPlato, setTipoPlato] = useState("compartir"); // Nuevo estado para "compartir" o "individual"
  const { comensal } = useComensal();
  const nombre = comensal.nombre || ""; // Obtener el nombre del comensal desde el contexto
  const alergias = comensal.alergias || ""; // Obtener las alergias del comensal desde el contexto
  const [acompanante, setAcompanante] = useState("");
  const [acompanantesDisponibles, setAcompanantesDisponibles] = useState([]);
  const [seleccionPrecio, setSeleccionPrecio] = useState(null);
  const [tipoPrecio, setTipoPrecio] = useState(null);
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState({});

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
          (producto) =>
            producto.tipo === "bebida" &&
            categoriasValidas.includes(producto.categoria.toLowerCase())
        );

        // Extraer solo nombres únicos
        const nombres = [...new Set(filtrados.map((p) => p.nombre))];

        setAcompanantesDisponibles(nombres);
      } catch (error) {
        console.error("Error al cargar acompañantes:", error);
      }
    };

    cargarAcompanantes();
  }, []);

  useEffect(() => {
    let initialTipoPrecio = null;
    let initialSeleccionPrecio = null;

    if (producto.tipo === "bebida") {
      if (producto.precios.precioBase !== null && producto.precios.precioBase >= 0) {
        initialTipoPrecio = "precioBase";
        initialSeleccionPrecio = producto.precios.precioBase;
      } else if (producto.precios.copa !== null && producto.precios.copa >= 0) {
        initialTipoPrecio = "copa";
        initialSeleccionPrecio = producto.precios.copa;
      } else if (producto.precios.botella !== null && producto.precios.botella >= 0) {
        initialTipoPrecio = "botella";
        initialSeleccionPrecio = producto.precios.botella;
      }
    } else {
      if (producto.precios.tapa !== null && producto.precios.tapa >= 0) {
        initialTipoPrecio = "tapa";
        initialSeleccionPrecio = producto.precios.tapa;
      } else if (producto.precios.racion !== null && producto.precios.racion >= 0) {
        initialTipoPrecio = "racion";
        initialSeleccionPrecio = producto.precios.racion;
      } else if (producto.precios.surtido !== null && producto.precios.surtido >= 0) {
        initialTipoPrecio = "surtido";
        initialSeleccionPrecio = producto.precios.surtido;
      } else if (producto.precios.precioBase !== null && producto.precios.precioBase >= 0) {
        initialTipoPrecio = "precioBase";
        initialSeleccionPrecio = producto.precios.precioBase;
      }
    }

    setTipoPrecio(initialTipoPrecio);
    setSeleccionPrecio(initialSeleccionPrecio);
  }, [producto]);

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
      setIngredientesEliminados((prev) =>
        prev.filter((ing) => ing !== ingrediente)
      );
    } else {
      setIngredientesSeleccionados((prev) =>
        prev.filter((ing) => ing !== ingrediente)
      );
      setIngredientesEliminados((prev) => [...prev, ingrediente]);
    }
  };

  const manejarTipoPlato = (e) => {
    setTipoPlato(e.target.value); // Actualizar tipo de plato ("compartir" o "individual")
  };

  const agregarAlCarrito = async () => {
    if (seleccionPrecio === null || tipoPrecio === null) {
      toast.error("Debes seleccionar un precio válido antes de continuar.");
      return;
    }
    const adicionalesSeleccionados = producto.adicionales
      ?.filter((_, index) => opcionesSeleccionadas[`adicional_${index}`])
      .map((a) => ({ nombre: a.nombre, precio: a.precio })) || [];

    const totalAdicionales = adicionalesSeleccionados.reduce(
      (acc, a) => acc + a.precio,
      0
    );

    const pedido = {
      productId: producto._id,
      cantidad,
      ingredientes: ingredientesEliminados, // Solo ingredientes eliminados
      opciones: opcionesSeleccionadas,
      precioSeleccionado: seleccionPrecio + totalAdicionales, // Asegúrate de incluir este campo
      total: seleccionPrecio * cantidad, // Calcular el total basado en el precio seleccionado
      tipoPrecio: tipoPrecio, // Asegúrate de incluir este campo
      mesa: numeroMesa,
      nombre,
      alergias,
      acompanante,
      tipoPlato: tipoPlato, // Agregar tipo de plato (compartir o individual)
      adicionales: adicionalesSeleccionados, // Incluye adicionales
    };

    try {
      const response = await api.post("/cart", {
        mesa: numeroMesa, // 🔹 Enviar `mesa` en la raíz
        items: [pedido], // 🔹 Enviar el producto dentro de `items`
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

      console.error("Error al agregar al carrito:", error);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-detalle">
      <div className="modal-contenido-detalle">
        <h2>
          <Trans>{producto.nombre}</Trans>
        </h2>

        <h4>
          <Trans>Ingredientes:</Trans>
        </h4>
        <ul>
          {producto.ingredientes.map((ingrediente) => (
            <li key={ingrediente}>
              <label>
                <input
                  type="checkbox"
                  className="checkbox-detalle"
                  checked={ingredientesSeleccionados.includes(ingrediente)}
                  onChange={(e) =>
                    manejarIngrediente(ingrediente, e.target.checked)
                  }
                />
                {ingrediente}
              </label>
            </li>
          ))}
        </ul>

        {producto.opcionesPersonalizables.length > 0 && (
          <>
            <h4>
              <Trans>Opciones:</Trans>
            </h4>
            {producto.opcionesPersonalizables.map((opcion) => (
              <div key={opcion.tipo}>
                <h5>
                  <Trans>{opcion.tipo}</Trans>
                </h5>
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

        <h4>
          <Trans>Cantidad:</Trans>
        </h4>
        <div>
          <button className="cantidad-btn" onClick={() => manejarCantidad(-1)}>
            -
          </button>
          <span>{cantidad}</span>
          <button className="cantidad-btn" onClick={() => manejarCantidad(1)}>
            +
          </button>
        </div>

        {producto.tipo !== "bebida" ? (
          (producto.precios.tapa !== null ||
            producto.precios.racion !== null ||
            producto.precios.surtido !== null) && (
            <>

              <select
                value={tipoPrecio}
                onChange={(e) => {
                  setTipoPrecio(e.target.value);
                  if (e.target.value === "tapa") {
                    setSeleccionPrecio(producto.precios.tapa);
                  } else if (e.target.value === "racion") {
                    setSeleccionPrecio(producto.precios.racion);
                  } else if (e.target.value === "surtido") {
                    setSeleccionPrecio(producto.precios.surtido);
                  } else if (e.target.value === "precioBase") {
                    setSeleccionPrecio(producto.precios.precioBase);
                  }
                }}
                className="tipo-precio-select-detalle"
              >
                {producto.precios.tapa !== null && (
                  <option value="tapa">
                    <Trans>Tapa</Trans> - {producto.precios.tapa} €
                  </option>
                )}
                {producto.precios.racion !== null && (
                  <option value="racion">
                    <Trans>Ración</Trans> - {producto.precios.racion} €
                  </option>
                )}
                {typeof producto.precios.surtido === "number" &&
                  !isNaN(producto.precios.surtido) && (
                    <option value="surtido">
                      <Trans>Surtido</Trans> - {producto.precios.surtido} €
                    </option>
                  )}
                {producto.precios.precioBase !== null && (
                  <option value="precioBase">
                    {producto.precios.precioBase} €
                  </option>
                )}
              </select>
            </>
          )
        ) : (
          <p>
            {producto.precios.precioBase !== null &&
              producto.precios.precioBase !== undefined ? (
              <p>
                <Trans>Precio:</Trans> {producto.precios.precioBase} €
              </p>
            ) : (
              <>
                <select
                  value={tipoPrecio}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setTipoPrecio(valor);
                    if (valor === "copa") {
                      setSeleccionPrecio(producto.precios.copa);
                    } else if (valor === "botella") {
                      setSeleccionPrecio(producto.precios.botella);
                    }
                  }}
                  className="tipo-precio-select-detalle"
                >
                  {producto.precios.copa !== null && (
                    <option value="copa">
                      <Trans>Copa</Trans> - {producto.precios.copa} €
                    </option>
                  )}
                  {producto.precios.botella !== null && (
                    <option value="botella">
                      <Trans>Botella</Trans> - {producto.precios.botella} €
                    </option>
                  )}
                </select>
              </>
            )}
          </p>
        )}

        {producto.tipo !== "bebida" && (
          <>
            <div className="tipo-plato-select-container-detalle">
              <select
                value={tipoPlato}
                onChange={manejarTipoPlato}
                className="tipo-plato-select-detalle"
              >
                <option value="compartir">
                  <Trans>Compartir</Trans>
                </option>
                <option value="individual">
                  <Trans>Individual</Trans>
                </option>
              </select>
            </div>
          </>
        )}

        {producto.tipo === "bebida" &&
          categoriasConAcompanante.includes(
            producto.categoria.toLowerCase()
          ) && (
            <>
              <h4>
                <Trans>Acompañante:</Trans>
              </h4>
              <div className="acompanante-select-container-detalle">
                <select
                  value={acompanante}
                  onChange={(e) => setAcompanante(e.target.value)}
                  className="acompanante-select-detalle"
                >
                  <option value="">
                    <Trans>Selecciona un acompañante</Trans>
                  </option>
                  {acompanantesDisponibles.map((nombre) => (
                    <option key={nombre} value={nombre}>
                      <Trans>{nombre}</Trans>
                    </option>
                  ))}
                  <option value="Sin acompañante">
                    <Trans>Sin acompañante</Trans>
                  </option>
                </select>
              </div>
            </>
          )}

         {producto.adicionales && producto.adicionales.length > 0 && (
          <>
            <h4>Adicionales:</h4>
            <ul>
              {producto.adicionales.map((adicional, index) => (
                <li key={index}>
                  <label>
                    <input
                      type="checkbox"
                      checked={opcionesSeleccionadas[`adicional_${index}`] || false}
                      onChange={(e) =>
                        setOpcionesSeleccionadas((prev) => ({
                          ...prev,
                          [`adicional_${index}`]: e.target.checked,
                        }))
                      }
                    />
                    {adicional.nombre} (+{adicional.precio} €)
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        <div>
          <button className="cancelar-btn" onClick={cerrarModal}>
            <Trans>Cancelar</Trans>
          </button>

          {numeroMesa && (
            <button className="agregar-btn" onClick={agregarAlCarrito}>
              <Trans>Agregar al carrito</Trans>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductoDetalle;
