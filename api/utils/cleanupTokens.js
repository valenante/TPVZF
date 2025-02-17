import TokenRevocado from '../src/models/TokenRevocado.js';

const limpiarTokensExpirados = async () => {
  try {
    const resultado = await TokenRevocado.deleteMany({ expiracion: { $lte: new Date() } });
  } catch (error) {
    console.error('Error al limpiar tokens expirados:', error);
  }
};

export default limpiarTokensExpirados;
