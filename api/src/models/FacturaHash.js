import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

const facturaHashSchema = new Schema({
  numeroFactura: { type: String, required: true, unique: true },
  fechaExpedicion: { type: Date, required: true },
  clienteNombre: { type: String },
  clienteNIF: { type: String },
  importeTotal: { type: Number, required: true },
  hash: { type: String, required: true },
  hashAnterior: { type: String, required: true },
  rectificada: {
    type: Boolean,
    default: false
  },
  facturaRectificativaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FacturaEncadenada',
    default: null
  }
}, { timestamps: true });

export default model('FacturaHash', facturaHashSchema);
