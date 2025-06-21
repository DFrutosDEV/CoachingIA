import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface INote extends Document {
  title: string;
  description: string;
  createdBy: ObjectId;
  to: ObjectId[];
  isDeleted: boolean;
}

const NoteSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'The title is required'],
    trim: true,
    maxlength: [50, 'The title cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'The description is required'],
    trim: true,
    maxlength: [500, 'The description cannot exceed 500 characters']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

NoteSchema.index({ title: 1 });
NoteSchema.index({ to: 1 });

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema); 