import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const CartItemSchema = new Schema({
  productId: { type: _Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true, default: 1 },
  opciones: { type: Object, default: {} }, // Opciones personalizables
  ingredientes: { type: [String], default: [] }, // Ingredientes personalizados
});

const CartSchema = new Schema({
  items: [CartItemSchema],
}, { timestamps: true });

export default model('Cart', CartSchema);
 