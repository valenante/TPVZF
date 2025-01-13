import { Schema, model } from 'mongoose';

const CajaDiariaSchema = new Schema({
  fecha: { type: Date, default: Date.now },
  ingresos: { type: Number, default: 0 },
  egresos: { type: Number, default: 0 },
  total: { type: Number, default: 0 }, // ingresos - egresos
});

export default model('CajaDiaria', CajaDiariaSchema);
