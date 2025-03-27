import React, { use, useEffect, useState } from "react";
import api from "../../utils/api";

const ReservasInfo = () => {
    const [reservas, setReservas] = useState([]);

    const obtenerReservas = async () => {
        try {
            const res = await api.get("/reservas");
            console.log("Reservas del día:", res.data);
            setReservas(res.data);
        } catch (error) {
            console.error("Error al obtener reservas:", error);
        }
    };

    useEffect(() => {
        obtenerReservas();
    }, []);

    const cancelarReserva = async (id, email) => {
        const razon = window.prompt("Escribe el motivo de cancelación:");

        if (!razon || razon.trim() === "") {
            alert("Cancelación abortada: necesitas escribir una razón.");
            return;
        }

        try {
            await api.put(`/reservas/${id}/cancelar`, { razon });
            obtenerReservas();
        } catch (error) {
            console.error("Error al cancelar reserva:", error);
        }
    };

    const aceptarReserva = async (id) => {
        try {
          await api.put(`/reservas/${id}/confirmar`);
          obtenerReservas();
        } catch (error) {
          console.error("Error al confirmar reserva:", error);
        }
      };
      

    return (
        <div className="reservas-info">
            <h2>Reservas del día</h2>
            {reservas.length === 0 ? (
                <p>No hay reservas registradas.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Personas</th>
                            <th>Hora</th>
                            <th>Mesa</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map((reserva) => (
                            <tr key={reserva._id}>
                                <td>{reserva.nombre}</td>
                                <td>{reserva.email}</td>
                                <td>{reserva.telefono}</td>
                                <td>{reserva.personas}</td>
                                <td>{new Date(reserva.hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                                <td>{reserva.mesaAsignada || "—"}</td>
                                <td>{reserva.estado}</td>
                                <td>
                                    {reserva.estado === "pendiente" ? (
                                        <>
                                            <button onClick={() => aceptarReserva(reserva._id)}>Aceptar</button>
                                            <button onClick={() => cancelarReserva(reserva._id, reserva.email)}>Rechazar</button>
                                        </>
                                    ) : reserva.estado !== "rechazada" ? (
                                        <button onClick={() => cancelarReserva(reserva._id, reserva.email)}>Cancelar</button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ReservasInfo;
