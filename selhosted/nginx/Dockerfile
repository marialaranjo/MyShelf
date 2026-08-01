# Nginx — serve o frontend de "MyShelf"
# Frontend baked-in: rebuild necessário após editar index.html / styles.css
FROM nginx:1.27-alpine

# Remover configuração default
RUN rm /etc/nginx/conf.d/default.conf /etc/nginx/nginx.conf

# Template da configuração. A chave da Google Books NÃO é cozida na imagem —
# é injetada em runtime pelo entrypoint, a partir de ${GOOGLE_BOOKS_KEY}.
COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template

# Entrypoint: faz envsubst da chave e arranca o Nginx
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Frontend estático
COPY frontend/ /usr/share/nginx/html/

EXPOSE 80

# Healthcheck para o docker-compose
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
