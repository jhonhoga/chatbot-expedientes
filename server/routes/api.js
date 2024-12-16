const express = require('express');
const { searchByRadicado, searchByAsunto, initializeSheet } = require('../services/sheets');

const router = express.Router();

// Initialize Google Sheets connection
initializeSheet().catch(error => {
  console.error('Failed to initialize Google Sheets:', error);
  process.exit(1);
});

// Middleware to log all requests
router.use((req, res, next) => {
  console.log('------- Incoming Request -------');
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Query endpoint
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'La consulta no puede estar vacía' 
      });
    }

    // Normalizar la entrada del usuario
    const userInput = query.toLowerCase().trim();
    console.log('Input del usuario normalizado:', userInput);
    
    // Verificar qué opción eligió el usuario
    const opcionesRadicado = new Set(['1', 'uno']);
    const opcionesAsunto = new Set(['2', 'dos']);
    const palabrasRadicado = ['radicado', 'por radicado'];
    const palabrasAsunto = ['asunto', 'por asunto'];

    console.log('¿Es opción radicado?', opcionesRadicado.has(userInput));
    console.log('¿Es opción asunto?', opcionesAsunto.has(userInput));
    console.log('¿Contiene palabra radicado?', palabrasRadicado.some(palabra => userInput.includes(palabra)));
    console.log('¿Contiene palabra asunto?', palabrasAsunto.some(palabra => userInput.includes(palabra)));

    // Comprobar coincidencias
    if (opcionesRadicado.has(userInput) || palabrasRadicado.some(palabra => userInput.includes(palabra))) {
      console.log('Seleccionó opción radicado');
      return res.json({
        response: 'Por favor, ingresa el número de radicado que deseas consultar.\nEjemplos de formato válido:\n- GOBOL-24-064752\n- 20241129\n- 20241129-1'
      });
    } else if (opcionesAsunto.has(userInput) || palabrasAsunto.some(palabra => userInput.includes(palabra))) {
      console.log('Seleccionó opción asunto');
      return res.json({
        response: 'Por favor, ingresa el asunto que deseas buscar.'
      });
    }

    // Determine if the query looks like any valid radicado format
    const hasLetterFormat = /^[A-Z]+-\d{2}-\d+$/.test(query.trim()); // GOBOL-24-063916
    const hasNumberFormat = /^\d{8}(-\d+)?$/.test(query.trim()); // 20241129 or 20241129-1
    const isSearchingRadicado = query.toUpperCase().includes('GOBOL') || query.toUpperCase().includes('EXT-BOL');
    let result;

    if (hasLetterFormat || hasNumberFormat) {
      console.log('Processing as exact radicado search');
      result = await searchByRadicado(query.trim());
    } else if (isSearchingRadicado) {
      console.log('Processing as partial radicado search - redirecting to asunto search');
      return res.json({
        response: 'Para buscar un radicado específico, por favor ingresa el número completo.\nEjemplos de formato válido:\n- GOBOL-24-064752\n- 20241129\n- 20241129-1'
      });
    } else {
      console.log('Processing as asunto search');
      result = await searchByAsunto(query);
    }

    if (!result.found) {
      return res.json({ 
        response: result.message 
      });
    }

    // Format the response based on whether it's a single result or multiple
    let responseText;
    if (Array.isArray(result.data)) {
      // Multiple results (asunto search)
      responseText = 'Encontré los siguientes resultados:\n\n' +
        result.data.map((item, index) => 
          `${index + 1}. Radicado: ${item.radicado}\n` +
          `   Fecha: ${item.fecha}\n` +
          `   Asunto: ${item.asunto}\n` +
          `   Estado: ${item.estado}\n` +
          `   Asignado a: ${item.asignado}\n` +
          `   Fecha estimada de respuesta: ${item.fechaEstimada}\n` +
          `   Respuesta: ${item.respuesta}\n` +
          `   Enlace: ${item.enlace}\n` +
          ` \n`
        ).join('');
    } else {
      // Single result (radicado search)
      responseText = 'Aquí está la información del radicado:\n\n' +
        `Radicado: ${result.data.radicado}\n` +
        `Fecha: ${result.data.fecha}\n` +
        `Asunto: ${result.data.asunto}\n` +
        `Estado: ${result.data.estado}\n` +
        `Asignado a: ${result.data.asignado}\n` +
        `Fecha estimada de respuesta: ${result.data.fechaEstimada}\n` +
        `Respuesta: ${result.data.respuesta}\n` +
        `Enlace: ${result.data.enlace}`;
    }

    res.json({ response: responseText });
  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({ 
      error: 'Error al procesar la consulta',
      details: error.message 
    });
  }
});

module.exports = router;