const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const path = require('path');

router.get('/', (req, res) => {
  try {
    // Leer el archivo Excel
    const workbook = XLSX.readFile(path.join(__dirname, '../data/database.xlsx'));
    
    // Obtener la hoja "Eventos"
    const worksheet = workbook.Sheets['Eventos'];
    
    if (!worksheet) {
      return res.status(404).json({ error: 'Hoja de eventos no encontrada' });
    }

    // Convertir la hoja a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Transformar los datos al formato requerido por el calendario
    const events = jsonData.map(row => ({
      title: row['Actividad'],
      tipo: row['Tipo de actividad'],
      start: new Date(row['Hora de inicio']).toISOString(),
      end: new Date(row['Hora de finalización']).toISOString(),
      location: row['Ubicación'],
      url: row['Enlace'] || undefined
    }));

    res.json(events);
  } catch (error) {
    console.error('Error al leer eventos:', error);
    res.status(500).json({ error: 'Error al obtener los eventos' });
  }
});

module.exports = router;
