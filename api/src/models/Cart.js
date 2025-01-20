import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const CartItemSchema = new Schema({
  productId: { type: _Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true, default: 1 },
  opciones: { type: Object, default: {} }, // Opciones personalizables
  ingredientes: { type: [String], default: [] }, // Ingredientes personalizados
  nombre: { type: String, required: true },
  precioSeleccionado: { type: Number, required: true }, // Precio seleccionado por el usuario
});

const CartSchema = new Schema({
  items: [CartItemSchema],
  mesa: { type: String, required: true },
}, { timestamps: true });

export default model('Cart', CartSchema);
 