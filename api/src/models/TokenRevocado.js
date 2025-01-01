const mongoose = require('mongoose');

const tokenRevocadoSchema = new mongoose.Schema({
  token: { type: String, required: true }, // Almacena el refresh token
  expiracion: { type: Date, required: true }, // Fecha de expiración del token
}, { timestamps: true });

module.exports = mongoose.model('TokenRevocado', tokenRevocadoSchema);
