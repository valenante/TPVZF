import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import AlertaMensaje from "../AlertaMensaje/AlertaMensaje"; // Componente para mostrar alertas
import "../../styles/ReservasModal.css";

const FormularioReservaModal = ({ visible, onClose, onSuccess }) => {
  const [franjas, setFranjas] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    personas: 1,
    franjaSeleccionada: null,
    horaSeleccionada: "",
  });

  const [mensajeAlerta, setMensajeAlerta] = useState(null);
  const fechaHoy = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (visible) {
      api
        .get(`/reservasConfiguracion?fecha=${fechaHoy}`)
        .then((res) => setFranjas(res.data.franjas || []))
        .catch((err) => console.error("Error obteniendo franjas", err));
    }
  }, [visible, fechaHoy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const generarHoras = (inicio, fin) => {
    const resultado = [];
    const [h1, m1] = inicio.split(":").map(Number);
    const [h2, m2] = fin.split(":").map(Number);
    const d = new Date();
    d.setHours(h1, m1, 0, 0);
    const finDate = new Date();
    finDate.setHours(h2, m2, 0, 0);

    while (d <= finDate) {
      resultado.push(d.toTimeString().slice(0, 5));
      d.setMinutes(d.getMinutes() + 30);
    }
    return resultado;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        nombre: formulario.nombre,
        email: formulario.email,
        telefono: formulario.telefono,
        personas: parseInt(formulario.personas),
        hora: `${fechaHoy}T${formulario.horaSeleccionada}:00`,
      };
      await api.post("/reservas", body);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al crear reserva:", err);
      setMensajeAlerta({ tipo: "error", mensaje: "Hubo un error al crear la reserva" });
    }
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        <h3>Nueva reserva</h3>
        <form onSubmit={handleSubmit}>
          <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} />
          <input name="telefono" type="tel" placeholder="Teléfono" onChange={handleChange} />
          <input name="personas" type="number" min="1" max="20" value={formulario.personas} onChange={handleChange} />

          <h4>Seleccionar franja:</h4>
          {franjas.map((f, i) => (
            <div key={i}>
              <strong>{f.horaInicio} - {f.horaFin}</strong>
              <select
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    franjaSeleccionada: f,
                    horaSeleccionada: e.target.value,
                  })
                }
              >
                <option value="">Seleccionar hora...</option>
                {generarHoras(f.horaInicio, f.horaFin).map((h, idx) => (
                  <option key={idx} value={h}>{h}</option>
                ))}
              </select>
            </div>
          ))}

          <div className="botones">
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
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

export default FormularioReservaModal;
