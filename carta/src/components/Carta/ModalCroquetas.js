import React, { useState } from "react";
import { Trans } from "@lingui/react";
import ReactDOM from "react-dom";
import api from "../../utils/api";
import { useSearchParams, useParams } from "react-router-dom";
import { toast } from "react-toastify"; // Importar toast
import "../../styles/ModalCroquetas.css";

const ModalCroquetas = ({ producto, cerrarModal, seleccionPrecio, tipoPrecio }) => {
    const [saboresSeleccionados, setSaboresSeleccionados] = useState([]);
    const [cantidad] = useState(1);
    const { numeroMesa } = useParams();
    const mesa = numeroMesa;
    const [searchParams] = useSearchParams();
    const nombre = searchParams.get("nombre");
    const [tipoPlato] = useState("compartir"); // Nuevo estado para "compartir" o "individual"
    const [error, setError] = useState(null);

    // Función para manejar la selección de sabores
    const manejarSabor = (ingrediente, incremento) => {
        if (seleccionPrecio === producto.precios.surtido) {
            const totalSeleccionado = saboresSeleccionados.reduce((total, sabor) => total + sabor.cantidad, 0);

            // Si el total de croquetas seleccionadas no supera 6, se puede incrementar
            if (totalSeleccionado + incremento <= 6 && incremento > 0) {
                setSaboresSeleccionados((prev) => {
                    const saborExistente = prev.find((sabor) => sabor.ingrediente === ingrediente);

                    if (saborExistente) {
                        // Si el sabor ya existe, aumentamos la cantidad de ese sabor
                        return prev.map((sabor) =>
                            sabor.ingrediente === ingrediente
                                ? { ...sabor, cantidad: sabor.cantidad + incremento }
                                : sabor
                        );
                    } else {
                        // Si no existe, lo agregamos con cantidad 1
                        return [...prev, { ingrediente, cantidad: 1 }];
                    }
                });
            } else if (totalSeleccionado + incremento > 6) {
                // Si se supera el total de 6 croquetas, mostramos error
                setError("No puedes seleccionar más de 6 croquetas en total.");
            } else if (incremento < 0) {
                // Si la cantidad es negativa (restar), solo podemos decrementar si ya hay una croqueta seleccionada
                setSaboresSeleccionados((prev) =>
                    prev.map((sabor) =>
                        sabor.ingrediente === ingrediente && sabor.cantidad > 0
                            ? { ...sabor, cantidad: sabor.cantidad + incremento }
                            : sabor
                    )
                );
            }
        } else {
            // Si no es surtido, solo debe seleccionar un sabor
            setSaboresSeleccionados([{ ingrediente, cantidad: 1 }]);
        }
    };

    // Lógica para verificar si el botón de agregar al carrito debe estar habilitado
    const isAddButtonDisabled = () => {
        if (seleccionPrecio === producto.precios.surtido) {
            // Para surtido, el total de sabores seleccionados debe ser 6
            return saboresSeleccionados.reduce((total, sabor) => total + sabor.cantidad, 0) !== 6;
        } else {
            // Para tapa o ración, solo debe haber un sabor seleccionado
            return saboresSeleccionados.length !== 1;
        }
    };

    const agregarAlCarrito = async () => {
        const carritoId = localStorage.getItem('carritoMongoId');

        const cartId = carritoId;

        const pedido = {
            cartId,
            productId: producto._id,
            cantidad,
            precioSeleccionado: seleccionPrecio, // Asegúrate de incluir este campo
            total: seleccionPrecio * cantidad, // Calcular el total basado en el precio seleccionado
            sabor: saboresSeleccionados.map(sabor => ({
                ingrediente: sabor.ingrediente,
                cantidad: sabor.cantidad,
            })),
            tipoCroqueta: tipoPrecio,
            mesa,
            nombre,
            tipoPlato, // Agregar tipo de plato (compartir o individual)
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
        <div className="modal-croquetas">
            <div className="modal-croquetas-content">
                <h2><Trans id="personalizar-croquetas">Personaliza tu {producto.nombre}</Trans></h2>

                <h4><Trans id="seleccionar-sabores">Selecciona los sabores:</Trans></h4>

                {/* Muestra todos los sabores disponibles */}
                <ul>
                    {producto.ingredientes.map((ingrediente) => (
                        <li key={ingrediente} className="sabor-croquetas">
                            <label>
                                <span><Trans id={`${ingrediente}`}>{ingrediente}</Trans></span>

                                {/* Mostrar solo si es surtido y se permite seleccionar cantidad */}
                                {seleccionPrecio === producto.precios.surtido ? (
                                    <div>
                                        <button
                                            disabled={saboresSeleccionados.filter(s => s.ingrediente === ingrediente).length === 0}
                                            onClick={() => manejarSabor(ingrediente, -1)} className="cantidad-btn-croquetas"
                                        >
                                            -                                        
                                        </button>
                                        <span>
                                            {
                                                saboresSeleccionados.find(s => s.ingrediente === ingrediente)
                                                    ? saboresSeleccionados.find(s => s.ingrediente === ingrediente).cantidad
                                                    : 0
                                            }
                                        </span>
                                        <button
                                            disabled={saboresSeleccionados.reduce((total, sabor) => total + sabor.cantidad, 0) >= 6 && saboresSeleccionados.filter(s => s.ingrediente === ingrediente).length >= 1}
                                            onClick={() => manejarSabor(ingrediente, 1)} className="cantidad-btn-croquetas"
                                        >
                                            +
                                        </button>
                                    </div>
                                ) : (
                                    <input
                                        type="radio"
                                        name="sabor"
                                        checked={saboresSeleccionados.some(s => s.ingrediente === ingrediente)}
                                        onChange={() => manejarSabor(ingrediente, 1)}
                                    />
                                )}
                            </label>
                        </li>
                    ))}
                </ul>

                {seleccionPrecio === producto.precios.surtido && (
                    <p><Trans id="seleccionar-exactamente-6-sabores">Selecciona exactamente 6 sabores.</Trans></p>
                )}

                {error && <p className="error-message">{error}</p>}

                <div>
                    <button onClick={cerrarModal} className="cancelar-btn">
                        <Trans id="cancelar">Cancelar</Trans>
                    </button>
                    <button
                        onClick={agregarAlCarrito}
                        className="agregar-btn"
                        disabled={isAddButtonDisabled()}
                    >
                        <Trans id="agregar-al-carrito">Agregar al carrito</Trans>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModalCroquetas;
