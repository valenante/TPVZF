const mongoose = require('mongoose');

const EliminacionSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  pedido: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true },
  cantidad: { type: Number, required: true },
  motivo: { type: String }, // Motivo opcional
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Eliminacion', EliminacionSchema);
