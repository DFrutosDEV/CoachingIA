import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  destinatario: ObjectId;
  sesion: ObjectId;
  clienteId: ObjectId;
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
  destinatario: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El destinatario es requerido']
  },
  sesion: {
    type: Schema.Types.ObjectId,
    ref: 'Meet',
    required: [true, 'La sesión es requerida']
  },
  clienteId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El cliente es requerido']
  },
  coachId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El coach es requerido']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
NoteSchema.index({ destinatario: 1 });
NoteSchema.index({ sesion: 1 });
NoteSchema.index({ clienteId: 1 });
NoteSchema.index({ coachId: 1 });
NoteSchema.index({ createdBy: 1 });

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema); 