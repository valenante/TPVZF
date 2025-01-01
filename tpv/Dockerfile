# Usar Node.js como imagen base para construir la aplicación
FROM node:16 AS build

# Crear y usar el directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Construir la aplicación
RUN npm run build

# Usar Nginx para servir la aplicación
FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
