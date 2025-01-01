const mongoose = require('mongoose');

const mesaSchema = new mongoose.Schema({
  numero: { type: Number, required: true }, // Número de la mesa
  estado: { type: String, enum: ['abierta', 'cerrada'], default: 'abierta' }, // Estado actual
  pedidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' }], // Pedidos activos en la mesa
  inicio: { type: Date, default: Date.now }, // Hora en que se abrió la mesa
  tokenLider: {
    type: String,
    default: null, // El token será nulo si no hay líder asignado
  },
  total: {
    type: Number,
    default: 0,
    set: function(value) {
      // Redondea el valor a dos decimales antes de guardarlo
      return parseFloat(value.toFixed(2));
    }
  },
});

module.exports = mongoose.model('Mesa', mesaSchema);
