import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IObjective extends Document {
  title: string;
  createdBy: ObjectId;
  clientId: ObjectId;
  coachId: ObjectId;
  isCompleted: boolean;
  active: boolean;
  configFile: {
    question: string;
    answer: string;
  }[];
}

const ObjectiveSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'The title is required'],
      trim: true,
      maxlength: [50, 'The title cannot exceed 50 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'The createdBy is required'],
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
    isCompleted: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    configFile: {
      type: [
        {
          question: String,
          answer: String,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ObjectiveSchema.index({ title: 1 });
ObjectiveSchema.index({ createdBy: 1 });
ObjectiveSchema.index({ clientId: 1 });
ObjectiveSchema.index({ isCompleted: 1 });
ObjectiveSchema.index({ active: 1 });

export default mongoose.models.Objective ||
  mongoose.model<IObjective>('Objective', ObjectiveSchema);
