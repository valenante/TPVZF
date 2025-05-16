import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

const productoSchema = new Schema(
  {
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true },
    precio: { type: Number, required: true },
  },
  { _id: false }
);

const facturaHashSchema = new Schema(
  {
    numeroFactura: { type: String, required: true, unique: true },
    fechaExpedicion: { type: Date, required: true },
    clienteNombre: { type: String },
    clienteNIF: { type: String },
    productos: { type: [productoSchema], required: true }, // 🔹 Nuevo campo para los productos
    importeTotal: { type: Number, required: true },
    hash: { type: String, required: true },
    hashAnterior: { type: String, required: true },
    rectificada: {
      type: Boolean,
      default: false,
    },
    facturaRectificativaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FacturaEncadenada',
      default: null,
    },
  },
  { timestamps: true }
);

export default model('FacturaHash', facturaHashSchema);
