import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../../utils/api";
import "./ModalTransferencia.css";

export default function ModalTransferirArticulos({ mesaOrigen, onClose }) {
    const [mesasAbiertas, setMesasAbiertas] = useState([]);
    const [mesaDestino, setMesaDestino] = useState(null);
    const [productosOrigen, setProductosOrigen] = useState([]);
    const [productosDestino, setProductosDestino] = useState([]);
    const [productosMap, setProductosMap] = useState({});

    useEffect(() => {
        const cargarProductosDetalles = async () => {
            const productosIds = mesaOrigen.pedidos.flatMap(pedido =>
                pedido.productos.map(prod => prod.producto)
            );

            if (productosIds.length > 0) {
                const { data: productosData } = await api.get('/productos', {
                    params: { ids: productosIds.join(',') }
                });

                const map = productosData.reduce((acc, producto) => {
                    acc[producto._id] = producto;
                    return acc;
                }, {});

                setProductosMap(map); // ✅ esto guarda el map en el estado

                const productosPedidos = mesaOrigen.pedidos.flatMap(pedido =>
                    pedido.productos.map(prod => ({
                        ...prod,
                        pedidoId: pedido._id,
                        tipoPedido: 'comida',
                    }))
                );

                const productosBebidas = (mesaOrigen.pedidosBebidas || []).flatMap(pedido =>
                    pedido.productos.map(prod => ({
                        ...prod,
                        pedidoId: pedido._id,
                        tipoPedido: 'bebida',
                    }))
                );

                setProductosOrigen([...productosPedidos, ...productosBebidas]);
            }
        };

        cargarProductosDetalles();
    }, [mesaOrigen]);

    useEffect(() => {
        const cargarMesasAbiertas = async () => {
            const { data } = await api.get("/mesas/mesas-abiertas/mesas-abiertas");
            setMesasAbiertas(data.filter(m => m._id !== mesaOrigen._id));
        };
        cargarMesasAbiertas();
    }, [mesaOrigen]);

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const sourceId = result.source.droppableId;
        const destId = result.destination.droppableId;

        if (sourceId === destId) return;

        // ORIGEN -> DESTINO (transferencia)
        if (sourceId === "origen" && destId === "destino" && mesaDestino) {
            const movedItem = productosOrigen[result.source.index];

            // 1. Si cantidad > 1, clonar una unidad y reducir cantidad
            if (movedItem.cantidad > 1) {
                const actualizado = { ...movedItem, cantidad: movedItem.cantidad - 1 };
                const clonado = { ...movedItem, cantidad: 1 };

                setProductosOrigen(prev => {
                    const nuevo = [...prev];
                    nuevo.splice(result.source.index, 1, actualizado);
                    return nuevo;
                });

                setProductosDestino(prev => [...prev, clonado]);
            } else {
                // Si cantidad === 1, mover completamente
                const item = productosOrigen[result.source.index];
                setProductosOrigen(prev => prev.filter((_, idx) => idx !== result.source.index));
                setProductosDestino(prev => [...prev, item]);
            }
        }

        // DESTINO -> ORIGEN (revertir transferencia)
        if (sourceId === "destino" && destId === "origen") {
            const movedItem = productosDestino[result.source.index];
            const precioUnitario = movedItem.total / movedItem.cantidad;

            // Buscar si ya existe uno igual en origen
            const indexExistente = productosOrigen.findIndex(p =>
                p.producto === movedItem.producto &&
                p.pedidoId === movedItem.pedidoId &&
                p.tipoPedido === movedItem.tipoPedido &&
                JSON.stringify(p.ingredientesEliminados || []) === JSON.stringify(movedItem.ingredientesEliminados || []) &&
                JSON.stringify(p.opcionesPersonalizables || []) === JSON.stringify(movedItem.opcionesPersonalizables || [])
            );

            if (indexExistente !== -1) {
                // Ya existe: sumar cantidad y total
                setProductosOrigen(prev => {
                    const nuevo = [...prev];
                    const original = nuevo[indexExistente];
                    original.cantidad += movedItem.cantidad;
                    original.total = +(original.total + movedItem.total).toFixed(2);
                    return nuevo;
                });
            } else {
                // No existe: agregar como nuevo
                setProductosOrigen(prev => [...prev, movedItem]);
            }

            // Quitar del destino
            setProductosDestino(prev => prev.filter((_, idx) => idx !== result.source.index));
        }

    };

    const confirmarTransferencia = async () => {
        try {
            for (const producto of productosDestino) {
                await api.post(`/mesas/mesas/transferir-producto`, {
                    productoId: producto._id,
                    pedidoId: producto.pedidoId,
                    desde: mesaOrigen._id,
                    hacia: mesaDestino,
                    tipoPedido: producto.tipoPedido,
                    cantidad: producto.cantidad,
                });
            }
            onClose();
        } catch (error) {
            console.error("Error al transferir productos:", error);
        }
    };

    return (
        <div className="modal-transferir-overlay">
            <div className="modal-transferir-content">
                <h2>Transferir Artículos</h2>
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="transferir-paneles">
                        <Droppable droppableId="origen">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="transferir-panel">
                                    <h3>Mesa {mesaOrigen.numero}</h3>
                                    {productosOrigen.map((prod, index) => (
                                        <Draggable key={prod._id + index} draggableId={prod._id + index} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="producto-transferible">
                                                    {prod.cantidad} x {productosMap[prod.producto]?.nombre || 'Producto'}                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        <div className="transferir-panel">
                            <h3>Selecciona Mesa Destino</h3>
                            <select value={mesaDestino || ""} onChange={(e) => setMesaDestino(e.target.value)}>
                                <option value="">Selecciona una mesa</option>
                                {mesasAbiertas.map(m => (
                                    <option key={m._id} value={m._id}>Mesa {m.numero}</option>
                                ))}
                            </select>
                            <Droppable droppableId="destino">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="zona-drop">
                                        {productosDestino.length === 0 && <p>Arrastra aquí los productos</p>}
                                        {productosDestino.map((prod, index) => (
                                            <Draggable key={prod._id + "_destino" + index} draggableId={prod._id + "_destino" + index} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="producto-transferible">
                                                        {prod.cantidad} x {productosMap[prod.producto]?.nombre || 'Producto'}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    </div>
                </DragDropContext>

                <div className="transferir-botones">
                    <button onClick={onClose} className="cerrar-transferencia">Cerrar</button>
                    <button
                        onClick={confirmarTransferencia}
                        disabled={!mesaDestino || productosDestino.length === 0}
                        className="confirmar-transferencia"
                    >
                        Transferir
                    </button>
                </div>
            </div>
        </div>
    );
}
