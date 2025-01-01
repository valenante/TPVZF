# Usar la imagen de Node.js como base
FROM node:16

# Crear y usar el directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos del proyecto
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Construir la aplicación (React o similar)
RUN npm run build

# Usar una imagen de Nginx para servir la aplicación
FROM nginx:alpine
COPY --from=0 /usr/src/app/build /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
