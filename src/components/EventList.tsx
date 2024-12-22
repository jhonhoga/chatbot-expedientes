import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Event {
  title: string;
  tipo: string;
  start: string;
  end: string;
  location: string;
  url?: string;
}

interface EventListProps {
  events: Event[];
  selectedDate?: Date;
}

export const EventList: React.FC<EventListProps> = ({ events, selectedDate }) => {
  const filteredEvents = selectedDate
    ? events.filter(event => {
        const eventDate = new Date(event.start);
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : events;

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4 overflow-y-auto max-h-[calc(100vh-500px)]">
      <h2 className="text-xl font-semibold mb-4">
        {selectedDate
          ? `Eventos para ${format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}`
          : 'Todos los eventos'}
      </h2>
      {filteredEvents.length === 0 ? (
        <p className="text-gray-500 italic">No hay eventos programados para esta fecha.</p>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.tipo}</p>
              <p className="text-sm">
                {format(new Date(event.start), "d MMM yyyy 'a las' HH:mm", { locale: es })} -{' '}
                {format(new Date(event.end), 'HH:mm', { locale: es })}
              </p>
              <p className="text-sm text-gray-700">{event.location}</p>
              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Más información
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
