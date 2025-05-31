import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import "../../styles/ReservasInfo.css";
import ReactCalendar from "react-calendar";
import AlertaMensaje from "../AlertaMensaje/AlertaMensaje"; // Componente para mostrar alertas
import "react-calendar/dist/Calendar.css";

const ReservasInfo = () => {
  const [reservas, setReservas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [fechasConReservas, setFechasConReservas] = useState([]);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

  const calendarioRef = useRef();

  const obtenerReservas = async (fecha) => {
    try {
      const res = await api.get(`/reservas/fecha?fecha=${fecha}`);
      const pendientes = await api.get("/reservas/fecha?estado=pendiente");

      const pendientesFiltradas = pendientes.data.filter(
        (pend) => !res.data.some((r) => r._id === pend._id)
      );

      setReservas([...res.data, ...pendientesFiltradas]);
    } catch (error) {
      console.error("Error al obtener reservas:", error);
    }
  };

  const obtenerFechasConReservas = async () => {
    try {
      const res = await api.get("/reservas/fechasReserva");
      setFechasConReservas(res.data);
    } catch (error) {
      console.error("Error al obtener fechas con reservas:", error);
    }
  };

  useEffect(() => {
    obtenerFechasConReservas();
  }, []);

  useEffect(() => {
    obtenerReservas(fechaSeleccionada);
  }, [fechaSeleccionada]);

  const cancelarReserva = async (id) => {
    const razon = window.prompt("Escribe el motivo de cancelación:");
    if (!razon || razon.trim() === "") return setMensajeAlerta({ tipo: "error", mensaje: "Error al cancelar la reserva" });
;
    try {
      await api.put(`/reservas/${id}/cancelar`, { razon });
      obtenerReservas(fechaSeleccionada);
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
    }
  };

  const aceptarReserva = async (id) => {
    try {
      await api.put(`/reservas/${id}/confirmar`);
      obtenerReservas(fechaSeleccionada);
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
    }
  };

  const esDiaConReserva = (fecha) => {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const dd = String(fecha.getDate()).padStart(2, "0");
    const fechaLocal = `${yyyy}-${mm}-${dd}`;
    return fechasConReservas.includes(fechaLocal);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarioRef.current && !calendarioRef.current.contains(e.target)) {
        setMostrarCalendario(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="reservas-info">
      <h2>Reservas</h2>

      <div className="calendar-dropdown">
        <p><strong>Día seleccionado:</strong> {fechaSeleccionada}</p>
        <button onClick={() => setMostrarCalendario(!mostrarCalendario)}>
          {mostrarCalendario ? "Cerrar calendario" : "Seleccionar fecha"}
        </button>

        {mostrarCalendario && (
          <div className="calendar-popup" ref={calendarioRef}>
            <ReactCalendar
              className="custom-calendar"
              value={new Date(fechaSeleccionada)}
              onChange={(date) => {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, "0");
                const dd = String(date.getDate()).padStart(2, "0");
                setFechaSeleccionada(`${yyyy}-${mm}-${dd}`);
              }}

              tileClassName={({ date, view }) => {
                if (view === "month" && esDiaConReserva(date)) {
                  return "reserva-dia";
                }
                return null;
              }}
              minDate={new Date()}
            />
          </div>
        )}
      </div>

      {reservas.length === 0 ? (
        <p>No hay reservas para este día.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Personas</th>
              <th>Hora</th>
              <th>Mensaje</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva._id}>
                <td>{reserva.nombre}</td>
                <td>{reserva.email}</td>
                <td>{reserva.telefono}</td>
                <td>{reserva.personas}</td>
                <td>
                  {new Date(reserva.hora).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </td>
                <td>{reserva.mensaje || "—"}</td>
                <td>{reserva.estado}</td>
                <td>
                  {reserva.estado === "pendiente" ? (
                    <>
                      <button onClick={() => aceptarReserva(reserva._id)}>Aceptar</button>
                      <button onClick={() => cancelarReserva(reserva._id)}>Rechazar</button>
                    </>
                  ) : reserva.estado !== "rechazada" ? (
                    <button onClick={() => cancelarReserva(reserva._id)}>Cancelar</button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
       {mensajeAlerta && (
              <AlertaMensaje
                tipo={mensajeAlerta.tipo}
                mensaje={mensajeAlerta.mensaje}
                onClose={() => setMensajeAlerta(null)}
              />
            )}
    </div>
  );
};

export default ReservasInfo;
