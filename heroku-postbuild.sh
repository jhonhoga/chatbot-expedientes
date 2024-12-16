#!/bin/bash
set -e

# Instalar dependencias del proyecto raíz
npm install

# Instalar dependencias del servidor
cd server
npm install
cd ..

# Construir frontend
npm run build

# Mostrar mensaje de éxito
echo "Construcción completada exitosamente"
