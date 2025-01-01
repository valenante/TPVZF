const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  mesa: { type: mongoose.Schema.Types.ObjectId, ref: 'Mesa', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Opcional
  alergias: { type: String, default: '' }, // Alergias o intolerancias
  comensales: { type: Number, required: true },
  productos: [
    {
      producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
      cantidad: { type: Number, required: true },
      eliminado: { type: Boolean, default: false }, // Indica si se eliminó
    },
  ],
  total: { type: Number, required: true },
  estado: { type: String, enum: ['pendiente', 'preparado', 'servido'], default: 'pendiente' },
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Pedido', PedidoSchema);
