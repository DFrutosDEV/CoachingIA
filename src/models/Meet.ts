import mongoose, { Document, Schema, ObjectId } from 'mongoose';
import { getBrowserLocale } from '../utils/validatesInputs';

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
  timezone: string = 'America/Mexico_City'
): Date {
  const utcDate = new Date(this.date);
  const localDate = new Date(
    utcDate.toLocaleString('en-US', { timeZone: timezone })
  );
  return localDate;
};

MeetSchema.methods.getLocalTime = function (
  timezone: string = 'America/Mexico_City'
): string {
  const localDate = this.getLocalDate(timezone);
  return localDate.toLocaleTimeString(getBrowserLocale(), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

MeetSchema.methods.getLocalDateString = function (
  timezone: string = 'America/Mexico_City'
): string {
  const localDate = this.getLocalDate(timezone);
  return localDate.toISOString().split('T')[0];
};

MeetSchema.index({ date: 1 });
MeetSchema.index({ createdBy: 1 });
MeetSchema.index({ clientId: 1 });
MeetSchema.index({ coachId: 1 });
MeetSchema.index({ isCancelled: 1 });
MeetSchema.index({ objectiveId: 1 });

export default mongoose.models.Meet ||
  mongoose.model<IMeet>('Meet', MeetSchema);
