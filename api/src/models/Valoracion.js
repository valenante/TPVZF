const mongoose = require('mongoose');

const ValoracionSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comentario: { type: String },
  puntuacion: { type: Number, min: 1, max: 5, required: true },
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Valoracion', ValoracionSchema);
