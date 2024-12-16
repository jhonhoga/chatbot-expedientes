import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MessageCircle, Bot, FileSearch } from 'lucide-react';
import { ChatMessage as ChatMessageType } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ServerStatus } from './components/ServerStatus';
import { sendQuery } from './services/api';
import { APIError } from './utils/errorHandling';

enum QueryStage {
  Initial,
  ChoosingQueryType,
  EnteringRadicado,
  EnteringAsunto,
  ShowingResults
}

function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryStage, setQueryStage] = useState<QueryStage>(QueryStage.Initial);
  const [queryResult, setQueryResult] = useState<string>('');
  const [selectedQueryType, setSelectedQueryType] = useState<'radicado' | 'asunto' | null>(null);
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use a ref to track if welcome message has been sent
  const welcomeMessageSent = useRef(false);

  const addMessage = useCallback((type: 'user' | 'bot', content: string) => {
    setMessages(prev => [...prev, { type, content }]);
  }, []);

  // Función para reiniciar el chat
  const resetChat = useCallback(() => {
    setMessages([]); // Limpia los mensajes
    setQueryStage(QueryStage.Initial);
    setQueryResult('');
    setSelectedQueryType(null);
    welcomeMessageSent.current = false;

    // Espera un momento antes de mostrar el mensaje de bienvenida
    setTimeout(() => {
      addMessage('bot', '¡Hola! 👋 Bienvenido al Centro de Consulta de Expedientes. Estoy aquí para ayudarte a encontrar la información que necesitas.\n\n¿Qué información deseas consultar?\n\n1. Consultar por Radicado\n2. Consultar por Asunto\n3. Terminar Chat');
      welcomeMessageSent.current = true;
      setQueryStage(QueryStage.ChoosingQueryType);
    }, 100);
  }, [addMessage]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!welcomeMessageSent.current) {
      addMessage('bot', '¡Hola! 👋 Bienvenido al Centro de Consulta de Expedientes. Estoy aquí para ayudarte a encontrar la información que necesitas.\n\n¿Qué información deseas consultar?\n\n1. Consultar por Radicado\n2. Consultar por Asunto\n3. Terminar Chat');
      welcomeMessageSent.current = true;
      setQueryStage(QueryStage.ChoosingQueryType);
    }
  }, [addMessage]);

  const handleQueryTypeSelection = useCallback((type: 'radicado' | 'asunto') => {
    setSelectedQueryType(type);
    if (type === 'radicado') {
      addMessage('bot', 'Por favor, escribe el número de radicado que deseas consultar.');
      setQueryStage(QueryStage.EnteringRadicado);
    } else {
      addMessage('bot', 'Escribe las palabras clave que contiene el asunto que deseas buscar.');
      setQueryStage(QueryStage.EnteringAsunto);
    }
  }, [addMessage]);

  const handleQuerySubmit = useCallback(async (queryText: string) => {
    setIsLoading(true);
    try {
      const response = await sendQuery(queryText);
      setQueryResult(response.response);
      addMessage('bot', response.response);
      addMessage('bot', '¿Deseas realizar otra consulta? Puedes:\n\n1. Consultar por Radicado\n2. Consultar por Asunto\n3. Terminar Chat');
      setQueryStage(QueryStage.ChoosingQueryType);
    } catch (error) {
      console.error('Query submission error:', error);
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Error al realizar la consulta. Por favor, intenta de nuevo.';
      addMessage('bot', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  const handleSendMessage = useCallback(async (message: string) => {
    addMessage('user', message);
    setIsLoading(true);

    try {
      switch (queryStage) {
        case QueryStage.Initial:
          break;
        case QueryStage.ChoosingQueryType:
          const userInput = message.trim().toLowerCase();
          const opcionesRadicado = ['1', 'uno', 'radicado'];
          const opcionesAsunto = ['2', 'dos', 'asunto'];
          const opcionesTerminar = ['3', 'tres', 'terminar', 'terminar chat'];
          
          if (opcionesRadicado.includes(userInput)) {
            handleQueryTypeSelection('radicado');
          } else if (opcionesAsunto.includes(userInput)) {
            handleQueryTypeSelection('asunto');
          } else if (opcionesTerminar.includes(userInput)) {
            addMessage('bot', '¡Hasta luego! Si necesitas consultar más información, estaré aquí para ayudarte. 👋');
            // Espera 1.5 segundos antes de reiniciar
            setTimeout(resetChat, 1500);
          } else {
            addMessage('bot', 'Por favor, selecciona una opción válida:\n\n1. Consultar por Radicado\n2. Consultar por Asunto\n3. Terminar Chat');
          }
          break;
        case QueryStage.EnteringRadicado:
        case QueryStage.EnteringAsunto:
          await handleQuerySubmit(message);
          break;
      }
    } catch (error) {
      console.error('Message processing error:', error);
      addMessage('bot', 'Ocurrió un error. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [queryStage, handleQueryTypeSelection, handleQuerySubmit, addMessage, resetChat]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <div className="flex items-center justify-start space-x-2">
          <FileSearch className="w-8 h-8" />
          <h1 className="text-xl font-semibold">Centro de Consulta de Expedientes - Secretaria de Servicios Públicos</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 p-2 sm:p-4 max-w-full">
        <div className="max-w-full mx-auto">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && (
            <div className="text-center text-gray-500 italic p-4">
              Cargando...
            </div>
          )}
          {/* Invisible div to enable scrolling to bottom */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ServerStatus 
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

export default App;