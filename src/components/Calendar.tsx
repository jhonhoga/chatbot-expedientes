import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
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

interface CalendarProps {
  events: Event[];
  onDateSelect: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onDateSelect }) => {
  const calendarEvents = events.map(event => ({
    title: event.title,
    start: event.start,
    end: event.end,
    url: event.url,
    extendedProps: {
      tipo: event.tipo,
      location: event.location
    }
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale="es"
        events={calendarEvents}
        selectable={true}
        select={(info) => onDateSelect(info.start)}
        height="auto"
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día'
        }}
      />
    </div>
  );
};
