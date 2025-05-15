import Evento from '../models/Evento';

// Función para registrar un evento
function registrarEvento(tipo, datos) {
  const nuevoEvento = new Evento({
    tipo, // Tipo de evento: 'creación de factura', 'envío de factura', 'modificación de factura', etc.
    datos, // Los datos específicos del evento
    fecha: new Date(),
  });

  return nuevoEvento.save();
}

export default registrarEvento;
