# Dockerfile para backend (Node.js)
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto de la aplicación
COPY . .

# Establecer variables de entorno
ENV NODE_ENV=production

# Exponer el puerto en el que corre tu aplicación
EXPOSE 3000

# Iniciar la aplicación
CMD ["node", "index.js"]
