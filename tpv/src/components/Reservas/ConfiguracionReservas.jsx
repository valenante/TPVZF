import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const ConfiguracionReservas = () => {
  const [franjas, setFranjas] = useState([
    { horaInicio: "13:00", horaFin: "17:00", maxReservas: 10 },
    { horaInicio: "19:30", horaFin: "24:00", maxReservas: 15 },
  ]);

  const fechaActual = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  useEffect(() => {
    api
      .get(`/reservasConfiguracion?fecha=${fechaActual}`)
      .then(res => {
        if (res.data?.franjas) {
          setFranjas(res.data.franjas);
        }
      })
      .catch(() => {});
  }, [fechaActual]);

  const handleChange = (index, field, value) => {
    const actualizadas = [...franjas];
    actualizadas[index][field] = value;
    setFranjas(actualizadas);
  };

  const agregarFranja = () => {
    setFranjas([...franjas, { horaInicio: "", horaFin: "", maxReservas: 5 }]);
  };

  const eliminarFranja = (index) => {
    const actualizadas = franjas.filter((_, i) => i !== index);
    setFranjas(actualizadas);
  };

  const guardarConfiguracion = async () => {
    try {
      await api.post("/reservasConfiguracion", {
        fecha: fechaActual,
        franjas,
      });
      alert("Configuración guardada correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error al guardar la configuración.");
    }
  };

  return (
    <div className="configuracion-reservas">
      <h2>Configuración de Reservas para el {fechaActual}</h2>

      {franjas.map((franja, index) => (
        <div key={index} className="franja-config">
          <label>
            Inicio:
            <input
              type="time"
              value={franja.horaInicio}
              onChange={(e) => handleChange(index, "horaInicio", e.target.value)}
            />
          </label>
          <label>
            Fin:
            <input
              type="time"
              value={franja.horaFin}
              onChange={(e) => handleChange(index, "horaFin", e.target.value)}
            />
          </label>
          <label>
            Máx reservas:
            <input
              type="number"
              value={franja.maxReservas}
              onChange={(e) => handleChange(index, "maxReservas", e.target.value)}
            />
          </label>
          <button onClick={() => eliminarFranja(index)}>❌</button>
        </div>
      ))}

      <button onClick={agregarFranja}>➕ Añadir franja</button>
      <button onClick={guardarConfiguracion}>💾 Guardar configuración</button>
    </div>
  );
};

export default ConfiguracionReservas;
