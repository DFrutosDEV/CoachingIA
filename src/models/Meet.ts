import mongoose, { Document, Schema, ObjectId } from 'mongoose';
import { toZonedTime } from 'date-fns-tz';
import {
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  formatUtcTime,
} from '../utils/date-formatter';

export interface IMeet extends Document {
  date: Date;
  link: string;
  createdBy: ObjectId;
  clientId: ObjectId;
  coachId: ObjectId;
  objectiveId: ObjectId;
  isCancelled: boolean;
}

const MeetSchema: Schema = new Schema(
  {
    date: {
      type: Date,
      required: [true, 'The date is required'],
      trim: true,
      set: function (date: any) {
        // Verificar si date es un objeto Date válido
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
          // Si no es válido, intentar convertirlo a Date
          const convertedDate = new Date(date);
          if (isNaN(convertedDate.getTime())) {
            throw new Error('Invalid date value');
          }
          return convertedDate;
        }
        // Si ya es un Date válido, devolverlo tal como está
        // La conversión a UTC ya se hace en el endpoint
        return date;
      },
    },
    link: {
      type: String,
      required: [true, 'The link is required'],
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'The clientId is required'],
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'The coachId is required'],
    },
    objectiveId: {
      type: Schema.Types.ObjectId,
      ref: 'Objective',
      required: [true, 'The objectiveId is required'],
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

MeetSchema.methods.getLocalDate = function (
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const utcDate = new Date(this.date);
  return toZonedTime(utcDate, timezone);
};

MeetSchema.methods.getLocalTime = function (
  timezone: string = DEFAULT_TIMEZONE
): string {
  return formatUtcTime(this.date, {
    locale: DEFAULT_LOCALE,
    timeZone: timezone,
    format: 'time-24',
  });
};

MeetSchema.methods.getLocalDateString = function (
  timezone: string = DEFAULT_TIMEZONE
): string {
  const zonedDate = this.getLocalDate(timezone);
  const year = zonedDate.getFullYear();
  const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
  const day = String(zonedDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

MeetSchema.index({ date: 1 });
MeetSchema.index({ createdBy: 1 });
MeetSchema.index({ clientId: 1 });
MeetSchema.index({ coachId: 1 });
MeetSchema.index({ isCancelled: 1 });
MeetSchema.index({ objectiveId: 1 });

export default mongoose.models.Meet ||
  mongoose.model<IMeet>('Meet', MeetSchema);
