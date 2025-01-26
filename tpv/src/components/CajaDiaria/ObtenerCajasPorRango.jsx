import api from '../../utils/api';

export const obtenerCajasPorRango = async (fechaInicio, fechaFin) => {
  const response = await api.get('cajaDiaria/rango/rango', {
    params: { fechaInicio, fechaFin },
  });
  console.log(response.data, 'nanana');
  return response.data;
};
