const renovarToken = async (setAccessToken) => {
  try {
    // Realiza la solicitud al endpoint de renovación de token
    const response = await fetch('http://172.20.10.7:3000/api/auth/refresh-token', {
      method: 'POST',
      credentials: 'include', // Asegura el envío de cookies
    });

    // Verifica si la respuesta es válida
    if (!response.ok) {
      throw new Error('No se pudo renovar el token.');
    }

    // Obtiene los datos de la respuesta
    const data = await response.json();

    // Actualiza el contexto o almacén con el nuevo token
    if (setAccessToken) {
      setAccessToken(data.accessToken);
    }

    return data.accessToken; // Devuelve el nuevo token
  } catch (error) {
    console.error('Error al renovar el token:', error);
    return null; // Devuelve null si falla
  }
};

export default renovarToken;
