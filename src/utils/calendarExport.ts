import { Event } from '@/types/event';

export interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  url?: string;
}

export const generateICSFile = (event: Event): string => {
  const startDate = new Date(`${event.date}T${event.time}`);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours duration

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Event App//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id}@eventapp.com
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${escapeText(event.title)}
DESCRIPTION:${escapeText(event.description)}
LOCATION:${escapeText(`${event.location}, ${event.address}`)}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

export const downloadICSFile = (event: Event): void => {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const getGoogleCalendarUrl = (event: Event): string => {
  const startDate = new Date(`${event.date}T${event.time}`);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: event.description,
    location: `${event.location}, ${event.address}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const getOutlookCalendarUrl = (event: Event): string => {
  const startDate = new Date(`${event.date}T${event.time}`);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: event.description,
    location: `${event.location}, ${event.address}`,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};