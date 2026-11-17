#!/bin/sh
# ─────────────────────────────────────────────────────────
# Entrypoint do Nginx — MyShelf
# ─────────────────────────────────────────────────────────
# Injeta a chave da Google Books (vinda do ambiente) no
# nginx.conf, substituindo APENAS ${GOOGLE_BOOKS_KEY}.
#
# O argumento '${GOOGLE_BOOKS_KEY}' passado ao envsubst limita
# a substituição a essa única variável — todos os $host,
# $args, $arg_q, etc. do Nginx ficam intactos.
# ─────────────────────────────────────────────────────────
set -e

if [ -z "$GOOGLE_BOOKS_KEY" ]; then
  echo "ERRO: variável de ambiente GOOGLE_BOOKS_KEY não definida." >&2
  echo "      Define-a no .env (ver .env.example) antes de arrancar." >&2
  exit 1
fi

envsubst '${GOOGLE_BOOKS_KEY}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/nginx.conf

# Validar a configuração antes de servir
nginx -t

exec nginx -g 'daemon off;'