import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { MessageCircle, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';

  const renderMessageContent = (content: string) => {
    // Split the message into lines
    const lines = content.split('\n');
    
    // If it's a result with multiple lines, add special formatting
    if (lines.length > 1 && !isUser) {
      return (
        <div className="whitespace-pre-wrap">
          {lines.map((line, index) => {
            // Check if line contains a colon (likely a key-value pair)
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim(); // Rejoin in case the value contains colons (like in URLs)
            
            // If this is not a key-value pair, return the line as is
            if (!value) {
              return <div key={index} className="mb-1">{line}</div>;
            }

            // Special handling for links
            if (key.trim().toLowerCase() === 'enlace') {
              return (
                <div key={index} className="mb-1">
                  <span className="font-semibold">{key}:</span>
                  {value !== 'No disponible' ? (
                    <a 
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-1"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="ml-1">{value}</span>
                  )}
                </div>
              );
            }

            // Regular key-value pair
            return (
              <div key={index} className="mb-1">
                <span className="font-semibold">{key}:</span>
                <span className="ml-1">{value}</span>
              </div>
            );
          })}
        </div>
      );
    }
    
    return <div className="whitespace-pre-wrap">{message.content}</div>;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 px-2 sm:px-4`}>
      <div className="flex items-start space-x-2">
        {!isUser && (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot className="w-5 h-5 text-gray-700" />
            </div>
            <span className="text-xs text-gray-500 mt-1">ExpediBot</span>
          </div>
        )}
        <div 
          className={`
            max-w-[90%]
            w-full
            md:max-w-[70%]
            p-2 sm:p-3 
            rounded-lg 
            text-sm sm:text-base
            ${isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'}
          `}
        >
          {renderMessageContent(message.content)}
        </div>
        {isUser && (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-500 mt-1">Usuario</span>
          </div>
        )}
      </div>
    </div>
  );
};