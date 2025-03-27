import React, { useEffect, useState } from "react";
import api from "../utils/api";

const Reserva = () => {
  const [franjas, setFranjas] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    personas: 1,
    franjaSeleccionada: null,
    horaSeleccionada: "",
  });

  const [mensaje, setMensaje] = useState("");

  const fechaHoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Validadores básicos
  const sanitizeInput = (text) => text.replace(/[<>]/g, "").trim();

  const esEmailValido = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const esTelefonoValido = (telefono) =>
    /^[0-9\s+\-()]{7,15}$/.test(telefono);

  const esNombreValido = (nombre) =>
    /^[a-zA-ZÀ-ÿ\s]{1,40}$/.test(nombre);

  useEffect(() => {
    const obtenerFranjas = async () => {
      try {
        const res = await api.get(`/reservasConfiguracion?fecha=${fechaHoy}`);
        if (res.data?.franjas) {
          setFranjas(res.data.franjas);
        }
      } catch (err) {
        console.error("Error al obtener franjas:", err);
      }
    };

    obtenerFranjas();
  }, [fechaHoy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const safeValue =
      ["email", "telefono"].includes(name) ? sanitizeInput(value) : value;

    setFormulario({ ...formulario, [name]: safeValue });
  };

  const generarHorasDentroDeFranja = (inicio, fin) => {
    const resultado = [];
    const [hInicio, mInicio] = inicio.split(":").map(Number);
    const [hFin, mFin] = fin.split(":").map(Number);

    const date = new Date();
    date.setHours(hInicio, mInicio, 0, 0);

    const finDate = new Date();
    finDate.setHours(hFin, mFin, 0, 0);

    while (date <= finDate) {
      const hora = date.toTimeString().slice(0, 5); // "HH:MM"
      resultado.push(hora);
      date.setMinutes(date.getMinutes() + 30);
    }

    return resultado;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formulario.franjaSeleccionada || !formulario.horaSeleccionada) {
      setMensaje("Debes seleccionar una hora dentro de la franja.");
      return;
    }

    if (!esEmailValido(formulario.email)) {
      setMensaje("Correo electrónico inválido.");
      return;
    }

    if (!esTelefonoValido(formulario.telefono)) {
      setMensaje("Teléfono inválido.");
      return;
    }

    try {
      const body = {
        nombre: formulario.nombre,
        email: formulario.email,
        telefono: formulario.telefono,
        personas: parseInt(formulario.personas),
        hora: `${fechaHoy}T${formulario.horaSeleccionada}:00`,
      };

      const res = await api.post("/reservas", body);

      setMensaje(res.data.mensaje || "Reserva enviada con éxito.");
      setFormulario({
        nombre: "",
        email: "",
        telefono: "",
        personas: 1,
        franjaSeleccionada: null,
        horaSeleccionada: "",
      });
    } catch (error) {
      console.error(error);
      if (error.response?.data?.mensaje) {
        setMensaje(error.response.data.mensaje);
      } else {
        setMensaje("Hubo un error al procesar la reserva.");
      }
          }
  };

  return (
    <div className="reserva-form">
      <h2>Haz tu reserva</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formulario.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formulario.email}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={formulario.telefono}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="personas"
          min="1"
          max="20"
          placeholder="Número de personas"
          value={formulario.personas}
          onChange={handleChange}
          required
        />

        <h4>Selecciona hora de reserva:</h4>
        {franjas.map((franja, index) => (
          <div key={index}>
            <strong>{franja.horaInicio} - {franja.horaFin}</strong>
            <select
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  franjaSeleccionada: franja,
                  horaSeleccionada: e.target.value,
                })
              }
              value={
                formulario.franjaSeleccionada === franja
                  ? formulario.horaSeleccionada || ""
                  : ""
              }
            >
              <option value="">Seleccionar hora...</option>
              {generarHorasDentroDeFranja(franja.horaInicio, franja.horaFin).map(
                (hora, i) => (
                  <option key={i} value={hora}>
                    {hora}
                  </option>
                )
              )}
            </select>
          </div>
        ))}

        <button
          type="submit"
          disabled={
            !formulario.email ||
            !formulario.telefono ||
            !formulario.personas ||
            !formulario.franjaSeleccionada ||
            !formulario.horaSeleccionada
          }
        >
          Reservar
        </button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default Reserva;
