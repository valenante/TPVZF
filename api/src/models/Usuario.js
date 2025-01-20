import { Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';

const userSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'camarero', 'cocinero'], default: 'user' }, // Rol del usuario
}, { timestamps: true });

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, 12); // Más rondas para mayor seguridad
  next();
});

// Método para verificar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await compare(candidatePassword, this.password);
};

export default model('User', userSchema);
