import { Schema, model } from 'mongoose';

const mesaSchema = new Schema({
  numero: { type: Number, required: true }, // Número de la mesa
  estado: { type: String, enum: ['abierta', 'cerrada'], default: 'abierta' }, // Estado actual
  pedidos: [{ type: Schema.Types.ObjectId, ref: 'Pedido' }], // Pedidos activos en la mesa
  pedidosBebidas: [{ type: Schema.Types.ObjectId, ref: 'PedidoBebida' }], // Pedidos de bebidas activos en la mesa
  inicio: { type: Date, default: Date.now }, // Hora en que se abrió la mesa
  tokenLider: {
    type: String,
    default: null, // El token será nulo si no hay líder asignado
  },
  total: {
    type: Number,
    default: 0,
    set: function(value) {
      return parseFloat(value.toFixed(2));
    }
  },
  comensales: {
    type: Number,
    default: 1, // ✅ Por defecto 1 si no se especifica
    min: 1      // ✅ No puede ser menor que 1
  }
});

export default model('Mesa', mesaSchema);
