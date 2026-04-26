import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';

export type IcsFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type IcsWeekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export interface IcsParticipant {
  email: string;
  name?: string;
}

export interface IcsRecurrence {
  frequency: IcsFrequency;
  interval?: number;
  count?: number;
  until?: Date;
  byDay?: IcsWeekday[];
}

export interface CreateIcsFileOptions {
  title: string;
  startDate: Date;
  endDate?: Date;
  durationMinutes?: number;
  description?: string;
  location?: string;
  meetingUrl?: string;
  organizer?: IcsParticipant;
  attendees?: IcsParticipant[];
  recurrence?: IcsRecurrence;
  fileNamePrefix?: string;
}

export interface CreatedIcsFile {
  filePath: string;
  fileName: string;
  contentType: 'text/calendar; charset=utf-8; method=REQUEST';
  uid: string;
}

//DURACION DE LA REUNION EN MINUTOS
const DEFAULT_DURATION_MINUTES = 30;
//CARPETA TEMPORAL DE LOS ARCHIVOS ICS
const TEMP_FOLDER_NAME = 'coachingia-ics';

const formatIcsDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};

const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

const escapeIcsText = (value: string): string => {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
};

const sanitizeFileName = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'calendar-invite';
};

const foldIcsLine = (line: string): string => {
  const maxLength = 75;
  if (line.length <= maxLength) {
    return line;
  }

  const chunks: string[] = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    chunks.push(remaining.slice(0, maxLength));
    remaining = ` ${remaining.slice(maxLength)}`;
  }

  chunks.push(remaining);
  return chunks.join('\r\n');
};

const buildRecurrenceRule = (recurrence?: IcsRecurrence): string | null => {
  if (!recurrence) {
    return null;
  }

  const ruleParts = [`FREQ=${recurrence.frequency}`];

  if (recurrence.interval && recurrence.interval > 1) {
    ruleParts.push(`INTERVAL=${recurrence.interval}`);
  }

  if (recurrence.count && recurrence.count > 0) {
    ruleParts.push(`COUNT=${recurrence.count}`);
  }

  if (recurrence.until) {
    ruleParts.push(`UNTIL=${formatIcsDate(recurrence.until)}`);
  }

  if (recurrence.byDay?.length) {
    ruleParts.push(`BYDAY=${recurrence.byDay.join(',')}`);
  }

  return `RRULE:${ruleParts.join(';')}`;
};

const buildParticipantLine = (
  type: 'ORGANIZER' | 'ATTENDEE',
  participant: IcsParticipant
): string => {
  const commonName = participant.name?.trim();
  const namePart = commonName ? `;CN=${escapeIcsText(commonName)}` : '';

  if (type === 'ORGANIZER') {
    return `ORGANIZER${namePart}:mailto:${participant.email}`;
  }

  return `ATTENDEE${namePart};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${participant.email}`;
};

export async function createIcsFile(
  options: CreateIcsFileOptions
): Promise<CreatedIcsFile> {
  if (!options.title.trim()) {
    throw new Error('El título del evento es requerido');
  }

  if (Number.isNaN(options.startDate.getTime())) {
    throw new Error('La fecha de inicio del evento no es válida');
  }

  const uid = randomUUID();
  const now = new Date();
  const endDate =
    options.endDate ||
    addMinutes(options.startDate, options.durationMinutes || DEFAULT_DURATION_MINUTES);

  if (Number.isNaN(endDate.getTime()) || endDate <= options.startDate) {
    throw new Error('La fecha de fin del evento no es válida');
  }

  const descriptionParts = [
    options.description,
    options.meetingUrl ? `Link de la reunión: ${options.meetingUrl}` : '',
  ].filter(Boolean);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KytCoaching//CoachingIA//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(options.startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${escapeIcsText(options.title)}`,
    descriptionParts.length
      ? `DESCRIPTION:${escapeIcsText(descriptionParts.join('\n'))}`
      : null,
    options.location ? `LOCATION:${escapeIcsText(options.location)}` : null,
    options.meetingUrl ? `URL:${options.meetingUrl}` : null,
    options.organizer ? buildParticipantLine('ORGANIZER', options.organizer) : null,
    ...(options.attendees || []).map(attendee =>
      buildParticipantLine('ATTENDEE', attendee)
    ),
    buildRecurrenceRule(options.recurrence),
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter((line): line is string => Boolean(line));

  const icsContent = `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
  const tempDirectory = path.join(os.tmpdir(), TEMP_FOLDER_NAME);
  await mkdir(tempDirectory, { recursive: true });

  const safePrefix = sanitizeFileName(options.fileNamePrefix || options.title);
  const fileName = `${safePrefix}-${uid}.ics`;
  const filePath = path.join(tempDirectory, fileName);

  await writeFile(filePath, icsContent, 'utf8');

  return {
    filePath,
    fileName,
    contentType: 'text/calendar; charset=utf-8; method=REQUEST',
    uid,
  };
}
