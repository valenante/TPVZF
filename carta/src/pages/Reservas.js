import React, { useEffect, useState } from "react";
import api from "../utils/api";
import TopBar from "../components/Navbar/Topbar";
import "../styles/Reserva.css";

const Reserva = () => {
  const [franjas, setFranjas] = useState([]);
  const [reservasEnFranja, setReservasEnFranja] = useState(0);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().slice(0, 10));
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [mostrarPrivacidad, setMostrarPrivacidad] = useState(false);


  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    personas: 1,
    franjaSeleccionada: null,
    horaSeleccionada: "",
    mensaje: "",
  });

  const [mensaje, setMensaje] = useState("");

  const sanitizeInput = (text) => text.replace(/[<>]/g, "").trim();
  const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const esTelefonoValido = (telefono) => /^[0-9\s+\-()]{7,15}$/.test(telefono);

  const obtenerNombreDia = (fecha) => {
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const index = new Date(fecha).getDay();
    return dias[index];
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      window.location.reload();
    }, 600000);

    return () => clearInterval(intervalo);
  }, []);

  const obtenerDatos = async (fecha) => {
    try {
      const [resFranjas, resDisponibilidad] = await Promise.all([
        api.get(`/reservasConfiguracion?fecha=${fecha}`),
        api.get("/disponibilidad"),
      ]);

      if (resFranjas.data?.franjas) {
        setFranjas(resFranjas.data.franjas);
      }

      if (resDisponibilidad.data) {
        const disponibilidadObj = resDisponibilidad.data;

        const diasHabilitados = Object.entries(disponibilidadObj)
          .filter(([dia, valor]) =>
            dia !== "_id" && dia !== "actualizadoEn" && dia !== "__v" && valor === true
          )
          .map(([dia]) => dia);

        setDisponibilidad(diasHabilitados);
      }
    } catch (err) {
      console.error("Error al obtener datos:", err);
    }
  };

  useEffect(() => {
    obtenerDatos(fechaSeleccionada);
  }, [fechaSeleccionada]);

  const obtenerReservasEnFranja = async (inicio, fin) => {
    try {
      const res = await api.get(`/reservas?desde=${fechaSeleccionada}T${inicio}:00&hasta=${fechaSeleccionada}T${fin}:00`);
      setReservasEnFranja(res.data?.length || 0);
    } catch (err) {
      console.error("Error al contar reservas:", err);
      setReservasEnFranja(0);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const safeValue = ["email", "telefono"].includes(name) ? sanitizeInput(value) : value;
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
      resultado.push(date.toTimeString().slice(0, 5));
      date.setMinutes(date.getMinutes() + 30);
    }

    return resultado;
  };

  const handleFranjaSeleccionada = (franja, horaSeleccionada) => {
    setFormulario({ ...formulario, franjaSeleccionada: franja, horaSeleccionada });
    obtenerReservasEnFranja(franja.horaInicio, franja.horaFin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const diaSemana = obtenerNombreDia(fechaSeleccionada);
    if (!disponibilidad.includes(diaSemana)) {
      setMensaje("No se permiten reservas para este día.");
      return;
    }

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

    if (!aceptaTerminos) {
      setMensaje("Debes aceptar los términos y condiciones.");
      return;
    }

    try {
      const body = {
        nombre: formulario.nombre,
        email: formulario.email,
        telefono: formulario.telefono,
        personas: parseInt(formulario.personas),
        hora: `${fechaSeleccionada}T${formulario.horaSeleccionada}:00`,
        mensaje: formulario.mensaje
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
        mensaje: ""
      });
      setReservasEnFranja(0);
      setAceptaTerminos(false);
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.mensaje || "Hubo un error al procesar la reserva.");
    }
  };

  return (
    <>
      <TopBar />
      <div className="reserva-form">
        <h2>Haz tu reserva</h2>

        <form onSubmit={handleSubmit}>
          <label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>

          <input type="text" name="nombre" placeholder="Nombre" value={formulario.nombre} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Correo electrónico" value={formulario.email} onChange={handleChange} required />
          <input type="tel" name="telefono" placeholder="Teléfono" value={formulario.telefono} onChange={handleChange} required />
          <input type="number" name="personas" min="1" max="20" placeholder="Número de personas" value={formulario.personas} onChange={handleChange} required />

          <textarea
            name="mensaje"
            placeholder="¿Deseas dejar un mensaje al restaurante? (opcional)"
            value={formulario.mensaje}
            onChange={handleChange}
            rows={3}
          />

          <h4>Selecciona hora de reserva:</h4>
          {franjas.map((franja, index) => (
            <div key={index}>
              <strong>{franja.horaInicio} - {franja.horaFin}</strong>
              <select
                onChange={(e) => handleFranjaSeleccionada(franja, e.target.value)}
                value={formulario.franjaSeleccionada === franja ? formulario.horaSeleccionada || "" : ""}
              >
                <option value="">Seleccionar hora...</option>
                {generarHorasDentroDeFranja(franja.horaInicio, franja.horaFin).map((hora, i) => (
                  <option key={i} value={hora}>{hora}</option>
                ))}
              </select>

              {formulario.franjaSeleccionada === franja && reservasEnFranja >= franja.maxReservas && (
                <p style={{ color: "red", fontWeight: "bold" }}>
                  Reservas completas. Las mesas se entregarán por orden de llegada.
                </p>
              )}
            </div>
          ))}

          <label className="acepta-terminos">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
            />
            He leído y acepto los <span className="link" onClick={() => setMostrarTerminos(true)}>términos y condiciones</span>.
          </label>

          <button
            type="submit"
            disabled={
              !formulario.email ||
              !formulario.telefono ||
              !formulario.personas ||
              !formulario.franjaSeleccionada ||
              !formulario.horaSeleccionada ||
              reservasEnFranja >= formulario.franjaSeleccionada?.maxReservas ||
              !aceptaTerminos
            }
          >
            Reservar
          </button>
        </form>

        {mensaje && <p>{mensaje}</p>}

        <div className="reserva-info-importante">
          <h4>⏳ Importante:</h4>
          <ul>
            <li>🔹 Tu reserva se mantendrá durante <strong>15 minutos</strong> después de la hora establecida. Pasado este tiempo, la mesa podrá ser reasignada a otros clientes.</li>
            <li>🔹 Las reservas tienen una duración máxima de <strong>hora y cuarenta y cinco minutos</strong>. Si necesitas más tiempo o hacer algún ajuste, avísanos con antelación.</li>
            <p className="privacidad-link">
            Los datos ingresados serán tratados conforme a nuestra <span className="link" onClick={() => setMostrarPrivacidad(true)}>política de privacidad</span>.
            </p>
          </ul>
        </div>
      </div>

      {mostrarTerminos && (
        <div className="modal-overlay" onClick={() => setMostrarTerminos(false)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <h2>Términos y condiciones</h2>
            <p>En Zabor Fetén, trabajamos para ofrecerte una experiencia excepcional en cada visita...</p>
            <ul>
              <li>🔹 <strong>Tiempo de espera para la reserva:</strong> Tu mesa estará reservada por 15 minutos a partir de la hora programada...</li>
              <li>🔹 <strong>Duración de la reserva:</strong> El tiempo máximo de uso de la mesa es de hora y cuarenta y cinco minutos...</li>
              <li>🔹 <strong>Modificación o cancelación:</strong> Si no puedes asistir o necesitas cambiar la hora de tu reserva...</li>
              <li>🔹 <strong>Reservas para grupos:</strong> Para grupos grandes, solicitamos puntualidad...</li>
            </ul>
            <p>💡 <strong>Consejo:</strong> Si te retrasas o tienes algún inconveniente, llámanos 📞 para intentar mantener tu mesa disponible.</p>
            <p>Gracias por tu comprensión y por ayudarnos a seguir ofreciendo un servicio eficiente y de calidad. ¡Te esperamos en Zabor Fetén para una experiencia gastronómica única! 🍷✨</p>
            <button onClick={() => setMostrarTerminos(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {mostrarPrivacidad && (
        <div className="modal-overlay" onClick={() => setMostrarPrivacidad(false)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <h2>Política de Privacidad - Zabor Fetén</h2>
            <p><strong>Última actualización:</strong> 12/03/2025</p>
            <p>En Zabor Fetén nos comprometemos a proteger la privacidad de nuestros clientes...</p>

            <h4>1. Información que Recopilamos</h4>
            <ul>
              <li>🔹 Nombre y apellidos</li>
              <li>🔹 Número de teléfono y correo electrónico</li>
              <li>🔹 Información de reservas (fecha, hora, número de personas)</li>
              <li>🔹 Preferencias alimenticias o restricciones (opcional)</li>
              <li>🔹 Información de pago (cuando aplique)</li>
              <li>🔹 Datos de navegación en nuestra web</li>
            </ul>

            <h4>2. Uso de la Información</h4>
            <ul>
              <li>✅ Gestionar reservas y brindar un mejor servicio</li>
              <li>✅ Confirmar, modificar o cancelar reservas</li>
              <li>✅ Enviar recordatorios o información relevante</li>
              <li>✅ Personalizar la experiencia gastronómica</li>
              <li>✅ Mejorar nuestra oferta y experiencia de usuario</li>
              <li>✅ Enviar promociones (si das tu consentimiento)</li>
            </ul>

            <h4>3. Protección de Datos</h4>
            <p>Tu información está protegida con medidas de seguridad...</p>

            <h4>4. Derechos del Usuario</h4>
            <p>Tienes derecho a acceder, modificar o eliminar tus datos personales...</p>

            <h4>5. Cambios en la Política</h4>
            <p>Nos reservamos el derecho de modificar esta política en cualquier momento...</p>

            <button onClick={() => setMostrarPrivacidad(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Reserva;
