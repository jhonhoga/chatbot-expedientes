#!/bin/sh
set -e

# Construir frontend
npm run build

# Mostrar mensaje de éxito
echo "Heroku postbuild completado exitosamente"
