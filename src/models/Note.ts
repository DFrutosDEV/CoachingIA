import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  clientId: ObjectId;
  objectiveId: ObjectId;
  sessionId: ObjectId;
  coachId: ObjectId;
  createdBy: ObjectId;
  isDeleted: boolean;
}

const NoteSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  content: {
    type: String,
    required: [true, 'El contenido es requerido'],
    trim: true,
    maxlength: [2000, 'El contenido no puede exceder 2000 caracteres']
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: [true, 'El destinatario es requerido']
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Meet',
  },
  objectiveId: {
    type: Schema.Types.ObjectId,
    ref: 'Objective',
  },
  coachId: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: [true, 'El coach es requerido']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

NoteSchema.index({ title: 1 });
NoteSchema.index({ clientId: 1 });
NoteSchema.index({ sessionId: 1 });
NoteSchema.index({ objectiveId: 1 });
NoteSchema.index({ coachId: 1 });
NoteSchema.index({ createdBy: 1 });

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema); 