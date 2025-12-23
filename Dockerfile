# Stage 1: Build
FROM node:24-alpine AS build

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto dei file e builda
COPY . .
RUN npm run build

# Stage 2: Serve la build con Nginx
#FROM nginx:alpine

# Copia i file buildati da React/Vite in Nginx
#COPY --from=build /app/dist /usr/share/nginx/html
#COPY --from=build /app/dist /var/www/myfamilydoc


# Copia eventuale config personalizzata Nginx (opzionale)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Espone la porta 80
#EXPOSE 80

# Avvia Nginx in foreground
#CMD ["nginx", "-g", "daemon off;"]
