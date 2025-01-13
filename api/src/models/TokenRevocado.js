import mongoose from 'mongoose';

const TokenRevocadoSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiracion: { type: Date, required: true },
});

const TokenRevocado = mongoose.model('TokenRevocado', TokenRevocadoSchema);

export default TokenRevocado;
