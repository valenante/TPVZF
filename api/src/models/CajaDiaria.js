const mongoose = require('mongoose');

const CajaDiariaSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  ingresos: { type: Number, default: 0 },
  egresos: { type: Number, default: 0 },
  total: { type: Number, default: 0 }, // ingresos - egresos
});

module.exports = mongoose.model('CajaDiaria', CajaDiariaSchema);
