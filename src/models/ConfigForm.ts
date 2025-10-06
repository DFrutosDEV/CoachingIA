import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IConfigForm extends Document {
  title: string;
  active: boolean;
  isObligatory: boolean;
  createdBy: ObjectId;
}

const ConfigFormSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'The title cannot exceed 100 characters'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    isObligatory: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

ConfigFormSchema.index({ title: 1 });
ConfigFormSchema.index({ createdBy: 1 });

export default mongoose.models.ConfigForm ||
  mongoose.model<IConfigForm>('ConfigForm', ConfigFormSchema);
