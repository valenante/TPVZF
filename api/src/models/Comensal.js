import { Schema, model } from 'mongoose';

const comensalSchema = new Schema(
  {
    mesa: { type: String, required: true },
    nombre: { type: String, required: true },
    alergias: { type: String, default: '' },
    esLider: { type: Boolean, default: false },
    comensales: { type: Number, default: null },
  },
  { timestamps: true }
);

export default model('Comensal', comensalSchema);
