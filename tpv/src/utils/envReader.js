const EnvReader = () => {
    const apiUrl = process.env.REACT_APP_API_URL; // Leer la variable de entorno
  
    console.log('Variable de entorno REACT_APP_API_URL:', apiUrl); // Mostrar en la consola
  
    return (
      <div>
        <h1>Variable de Entorno</h1>
        <p><strong>REACT_APP_API_URL:</strong> {apiUrl || 'No definida o no cargada'}</p>
      </div>
    );
  };
  
  export default EnvReader;
  