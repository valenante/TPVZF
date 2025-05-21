import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./CarritoOrganizable.css"; // Asegúrate de tener este archivo CSS

const CarritoOrganizable = ({ carritoSecciones, setCarritoSecciones, enviarPedido, isLoading }) => {
    const onDragEnd = (result) => {
        if (!result.destination) return;

        const sourceSection = result.source.droppableId;
        const destSection = result.destination.droppableId;

        if (sourceSection === destSection && result.source.index === result.destination.index) {
            return;
        }

        const sourceItems = Array.from(carritoSecciones[sourceSection]);
        const [movedItem] = sourceItems.splice(result.source.index, 1);
        const updatedMovedItem = { ...movedItem, seccion: destSection };
        const destItems = Array.from(carritoSecciones[destSection]);
        destItems.splice(result.destination.index, 0, updatedMovedItem);

        setCarritoSecciones({
            ...carritoSecciones,
            [sourceSection]: sourceItems,
            [destSection]: destItems,
        });
    };

    const eliminarProducto = (seccion, index) => {
        const newSectionItems = [...carritoSecciones[seccion]];
        newSectionItems.splice(index, 1);
        setCarritoSecciones({
            ...carritoSecciones,
            [seccion]: newSectionItems,
        });
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="carrito-organizable-container">
                {["entrante", "medio", "final"].map((section) => (
                    <Droppable key={section} droppableId={section}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`carrito-section ${snapshot.isDraggingOver ? "drag-over" : ""}`}
                            >
                                <h4 className="carrito-section-title">{section.toUpperCase()}</h4>
                                {carritoSecciones[section].map((item, index) => (
                                    <Draggable key={item._id + index} draggableId={item._id + index} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`carrito-item ${snapshot.isDragging ? "dragging" : ""}`}
                                            >
                                                <div className="carrito-item-nombre">
                                                    {item.nombre} x{item.cantidad}
                                                </div>
                                                <div className="carrito-item-eliminar">
                                                    <button
                                                        onClick={() => eliminarProducto(section, index)}
                                                        className="carrito-eliminar-button"
                                                        title="Eliminar"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>

            <div className="carrito-enviar-container">
                <button
                    onClick={enviarPedido}
                    disabled={isLoading}
                    className="carrito-enviar-button"
                >
                    {isLoading ? "Enviando..." : "Enviar Pedido"}
                </button>
            </div>
        </DragDropContext>
    );
};

export default CarritoOrganizable;
