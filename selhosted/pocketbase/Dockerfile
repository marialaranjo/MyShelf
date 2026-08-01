# PocketBase — backend de "MyShelf"
# Imagem mínima Alpine + binário oficial
FROM alpine:3.20

ARG PB_VERSION=0.22.21

RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget

# Descarregar PocketBase oficial
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    -O /tmp/pb.zip \
 && unzip /tmp/pb.zip -d /pb \
 && rm /tmp/pb.zip \
 && chmod +x /pb/pocketbase

# Diretórios persistentes (montados como volumes pelo docker-compose)
RUN mkdir -p /pb/pb_data /pb/pb_migrations /pb/pb_public

# Migrações copiadas para dentro da imagem (aplicadas no arranque)
COPY pb_migrations/ /pb/pb_migrations/

WORKDIR /pb

EXPOSE 8090

# Servir em todas as interfaces dentro do container
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
 
