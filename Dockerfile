# Utiliza una imagen base con Nginx instalado
FROM nginx:latest
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html/
# Exponer el puerto 80 para permitir el acceso a través de HTTP
EXPOSE 3000