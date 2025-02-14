import api from '../../utils/api';

export const obtenerCajasPorRango = async (fechaInicio, fechaFin) => {
  const response = await api.get('caja/total', {
    params: { fechaInicio, fechaFin },
  });
  return response.data;
};
