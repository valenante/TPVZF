module.exports = {
    locales: ["en", "es"], // Idiomas que usarás
    sourceLocale: "en", // Idioma por defecto (fuente)
    catalogs: [
      {
        path: "src/locales/{locale}/messages", // Ruta donde se guardarán las traducciones
        include: ["src"], // Carpeta donde buscará texto traducible
      },
    ],
    format: "po", // Formato de los archivos de traducción
  };
  