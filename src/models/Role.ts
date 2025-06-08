import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IRole extends Document {
  nombre: string;
  codigo: string;
  activo: boolean;
}

const RoleSchema: Schema = new Schema({
  nombre: {
    type: String,
    required: [true, 'The name is required'],
    trim: true,
    maxlength: [50, 'The name cannot exceed 50 characters']
  },
  codigo: {
    type: String,
    required: [true, 'The code is required'],
    trim: true,
    maxlength: [50, 'The code cannot exceed 50 characters']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

RoleSchema.index({ nombre: 1 });

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema); 