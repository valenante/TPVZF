import { Schema, model } from 'mongoose';

const EliminacionSchema = new Schema({
  producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
  pedido: { type: Schema.Types.ObjectId, ref: 'Pedido', required: true },
  cantidad: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mesa: { type: Schema.Types.ObjectId, ref: 'Mesa', required: true }, // Agregar referencia a la mesa
});

export default model('Eliminacion', EliminacionSchema);
