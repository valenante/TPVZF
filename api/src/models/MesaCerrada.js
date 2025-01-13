import { Schema, model } from 'mongoose';

const mesaCerradaSchema = new Schema({
  numero: { type: Number, required: true }, // Número de la mesa
  pedidos: [{ type: Schema.Types.ObjectId, ref: 'Pedido' }], // Pedidos realizados en esta sesión
  total: { type: Number, required: true }, // Total acumulado de la cuenta
  inicio: { type: Date, required: true }, // Hora en que se abrió la mesa
  cierre: { type: Date, default: Date.now }, // Hora en que se cerró la mesa
  metodoPago: {
    efectivo: {
        type: Number,
        default: 0
    },
    tarjeta: {
        type: Number,
        default: 0
    }
}
});

export default model('MesaCerrada', mesaCerradaSchema);
