const mongoose = require('mongoose');

const ContraseñaSchema = new mongoose.Schema({
  valor: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  estado: { type: Boolean, default: true },
});

module.exports = mongoose.model('Contraseña', ContraseñaSchema);
