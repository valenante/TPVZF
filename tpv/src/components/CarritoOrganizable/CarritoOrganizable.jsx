import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const CarritoOrganizable = ({ carritoSecciones, setCarritoSecciones, enviarPedido, isLoading }) => {

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const sourceSection = result.source.droppableId;
        const destSection = result.destination.droppableId;

        // ✅ Evitar acción si se suelta en la misma posición
        if (sourceSection === destSection && result.source.index === result.destination.index) {
            return;
        }

        const sourceItems = Array.from(carritoSecciones[sourceSection]);
        const [movedItem] = sourceItems.splice(result.source.index, 1);

        // ✅ Asignar el nuevo campo seccion
        const updatedMovedItem = { ...movedItem, seccion: destSection };

        const destItems = Array.from(carritoSecciones[destSection]);
        destItems.splice(result.destination.index, 0, updatedMovedItem);

        setCarritoSecciones({
            ...carritoSecciones,
            [sourceSection]: sourceItems,
            [destSection]: destItems,
        });
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div style={{ display: "block", gap: "10px" }}>
                    {["entrante", "medio", "final"].map((section) => (
                        <Droppable key={section} droppableId={section}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{
                                        border: "1px solid #ccc",
                                        borderRadius: "5px",
                                        padding: "10px",
                                        marginBottom: "15px", // espacio entre secciones
                                        minHeight: "150px",
                                        backgroundColor: snapshot.isDraggingOver ? "#f0f0f0" : "white",
                                    }}
                                >
                                    <h4>{section.toUpperCase()}</h4>
                                    {carritoSecciones[section].map((item, index) => (
                                        <Draggable key={item._id + index} draggableId={item._id + index} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        padding: "5px",
                                                        margin: "5px 0",
                                                        backgroundColor: snapshot.isDragging ? "#e0e0e0" : "#f5f5f5",
                                                        border: "1px solid #ddd",
                                                        borderRadius: "3px",
                                                        cursor: "grab",
                                                    }}
                                                >
                                                    {item.nombre} x{item.cantidad}
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
            </DragDropContext>

            <div style={{ marginTop: "10px", textAlign: "center" }}>
                <button onClick={enviarPedido} disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar Pedido"}
                </button>
            </div>
        </>
    );
};

export default CarritoOrganizable;
