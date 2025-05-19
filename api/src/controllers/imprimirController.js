import axios from 'axios';

// IP Tailscale del servidor impresión
const IMPRESION_SERVER = 'http://100.91.21.52:4000';

export const imprimirPlatos = async (req, res) => {
  try {
    const { mesaNumero, comensales, productos, total } = req.body;

    // Reenviar la petición al servidor impresión
    const response = await axios.post(`${IMPRESION_SERVER}/imprimir`, {
      mesaNumero,
      comensales,
      productos,
      total,
    });

    res.status(200).json({ message: 'Pedido de platos enviado a la impresora', data: response.data });
  } catch (error) {
    console.error('Error al imprimir platos:', error.message);
    res.status(500).json({ error: 'Error al imprimir platos', details: error.message });
  }
};

export const imprimirBebidas = async (req, res) => {
  try {
    const { mesaNumero, comensales, productos, total } = req.body;

    const response = await axios.post(`${IMPRESION_SERVER}/imprimir-bebidas`, {
      mesaNumero,
      comensales,
      productos,
      total,
    });

    res.status(200).json({ message: 'Pedido de bebidas enviado a la impresora', data: response.data });
  } catch (error) {
    console.error('Error al imprimir bebidas:', error.message);
    res.status(500).json({ error: 'Error al imprimir bebidas', details: error.message });
  }
};



