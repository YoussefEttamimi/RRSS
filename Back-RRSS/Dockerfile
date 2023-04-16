# Base image
FROM node:latest AS builder

# Crea un directorio para tu aplicación
WORKDIR /app/rrss_backend

# Instala las dependencias
COPY package*.json ./
RUN npm install

# Copia el código de tu aplicación
COPY . .

# Iniciamos MongoDB en segundo plano y luego la aplicación Node.js
CMD ["npm", "start"]