// services/numeroFacturaService.js
import ContadorFactura from '../models/ContadorFactura.js';

export const obtenerNumeroFactura = async () => {
  const year = new Date().getFullYear();
  let contador = await ContadorFactura.findOne({ year });

  if (!contador) {
    contador = new ContadorFactura({ year, lastNumber: 1 });
  } else {
    contador.lastNumber += 1;
  }

  await contador.save();
  return `${year}-${contador.lastNumber.toString().padStart(4, '0')}`;
};
