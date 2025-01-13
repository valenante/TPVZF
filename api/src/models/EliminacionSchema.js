import { Schema, model } from 'mongoose';

const EliminacionSchema = new Schema({
  producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
  pedido: { type: Schema.Types.ObjectId, ref: 'Pedido', required: true },
  cantidad: { type: Number, required: true },
  motivo: { type: String }, // Motivo opcional
  fecha: { type: Date, default: Date.now },
});

export default model('Eliminacion', EliminacionSchema);
