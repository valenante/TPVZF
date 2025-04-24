const renovarToken = async (setAccessToken) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('No se pudo renovar el token.');
    }

    const data = await response.json();

    if (setAccessToken) {
      setAccessToken(data.accessToken);
    }

    return data.accessToken;
  } catch (error) {
    console.error('Error al renovar el token:', error);
    return null;
  }
};

export default renovarToken;
