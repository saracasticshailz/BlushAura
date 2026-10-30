#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
umask 077
mkdir -p .local
if [ -f .local/database.properties ] && [ -f .local/postgres.env ]; then
  echo "Local database settings already exist; preserving them."
  exit 0
fi
if [ -f .local/database.properties ] || [ -f .local/postgres.env ]; then
  echo "Local settings are incomplete. Restore both database.properties and postgres.env before continuing." >&2
  exit 1
fi
blushaura_password=$(openssl rand -hex 24)
printf 'DB_PASSWORD=%s\n' "$blushaura_password" > .local/database.properties
printf 'POSTGRES_PASSWORD=%s\n' "$blushaura_password" > .local/postgres.env
unset blushaura_password
echo "Private local database settings created in backend/.local."
