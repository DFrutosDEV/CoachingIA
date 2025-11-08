import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IGoal extends Document {
  objectiveId: ObjectId;
  description: string;
  createdBy: ObjectId;
  clientId: ObjectId;
  day: string;
  date: Date;
  isCompleted: boolean;
  feedbackId?: ObjectId;
  isDeleted: boolean;
  aforism?: string;
  tiempoEstimado?: string;
  ejemplo?: string;
  indicadorExito?: string;
}

const GoalSchema: Schema = new Schema(
  {
    objectiveId: {
      type: Schema.Types.ObjectId,
      ref: 'Objective',
      required: [true, 'The objectiveId is required'],
      trim: true,
      maxlength: [50, 'The objectiveId cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'The description is required'],
      trim: true,
      maxlength: [500, 'The description cannot exceed 500 characters'],
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
    day: {
      type: String,
      required: [true, 'The day is required'],
    },
    date: {
      type: Date,
      required: [true, 'The date is required'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    feedbackId: {
      type: Schema.Types.ObjectId,
      ref: 'Feedback',
      required: false,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    aforism: {
      type: String,
      required: false,
      trim: true,
      maxlength: [300, 'El aforismo no puede exceder 300 caracteres'],
    },
    tiempoEstimado: {
      type: String,
      required: false,
      trim: true,
      maxlength: [100, 'El tiempo estimado no puede exceder 100 caracteres'],
    },
    ejemplo: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, 'El ejemplo no puede exceder 500 caracteres'],
    },
    indicadorExito: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, 'El indicador de éxito no puede exceder 500 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

GoalSchema.index({ objectiveId: 1 });
GoalSchema.index({ createdBy: 1 });
GoalSchema.index({ clientId: 1 });
GoalSchema.index({ day: 1 });
GoalSchema.index({ isCompleted: 1 });
GoalSchema.index({ feedbackId: 1 });

export default mongoose.models.Goal ||
  mongoose.model<IGoal>('Goal', GoalSchema);
