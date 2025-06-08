import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface ILogs extends Document {
  fileName: string;
  date: string;
}

const LogsSchema: Schema = new Schema({
  fileName: {
    type: String,
    required: [true, 'The file name is required'],
    trim: true,
    maxlength: [50, 'The file name cannot exceed 50 characters']
  },
  date: {
    type: String,
    required: [true, 'The date is required'],
    trim: true,
    maxlength: [50, 'The date cannot exceed 50 characters']
  },
}, {
  timestamps: true
});

LogsSchema.index({ fileName: 1 });

export default mongoose.models.Logs || mongoose.model<ILogs>('Logs', LogsSchema); 