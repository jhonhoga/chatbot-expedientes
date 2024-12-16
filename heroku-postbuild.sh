#!/bin/sh
set -e

# Cambiar al directorio del proyecto
cd "$(dirname "$0")"

# Construir frontend
npm run build

# Mostrar mensaje de éxito
echo "Heroku postbuild completado exitosamente"
