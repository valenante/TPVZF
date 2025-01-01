const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true, default: 1 },
  opciones: { type: Object, default: {} }, // Opciones personalizables
  ingredientes: { type: [String], default: [] }, // Ingredientes personalizados
});

const CartSchema = new Schema({
  items: [CartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
 