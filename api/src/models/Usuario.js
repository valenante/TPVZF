import { Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';

const userSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'camarero', 'cocinero'], default: 'user' }, // Rol del usuario
  isBlocked: { type: Boolean, default: false }, // Indica si la cuenta está bloqueada
  blockedUntil: { type: Date, default: null },  // Tiempo hasta que se desbloquee la cuenta
  failedAttempts: { type: Number, default: 0 }, // Intentos fallidos
}, { timestamps: true });

userSchema.methods.resetFailedAttempts = function () {
  this.failedAttempts = 0;
  return this.save();
};

userSchema.methods.incrementFailedAttempts = function () {
  this.failedAttempts += 1;
  return this.save();
};

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
