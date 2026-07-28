# Dockerfile para el backend API
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 4000

# Comando de inicio
CMD ["npm", "start"]
