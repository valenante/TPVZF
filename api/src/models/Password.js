import { Schema, model } from 'mongoose';

const PasswordSchema = new Schema({
  clave: { type: String, required: true, unique: true }, // Ej: "contraseñaDelDía"
  valor: { type: String, required: true }, // La contraseña en sí
  fecha: { type: Date, default: Date.now }, // Fecha de creación/actualización
  estado: { type: Boolean, default: true }, // Estado activo/inactivo
});

export default model('Password', PasswordSchema);
