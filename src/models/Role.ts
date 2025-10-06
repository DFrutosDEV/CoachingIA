import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  code: string;
  active: boolean;
}

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'The name is required'],
      trim: true,
      maxlength: [50, 'The name cannot exceed 50 characters'],
    },
    code: {
      type: String,
      required: [true, 'The code is required'],
      trim: true,
      maxlength: [50, 'The code cannot exceed 50 characters'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

RoleSchema.index({ name: 1 });

export default mongoose.models.Role ||
  mongoose.model<IRole>('Role', RoleSchema);
