import { Schema, model } from 'mongoose';

const contadorFacturaSchema = new Schema({
  year: { type: Number, required: true, unique: true },
  lastNumber: { type: Number, default: 0 },
});

export default model('ContadorFactura', contadorFacturaSchema);
