import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IGoal extends Document {
  objectives: ObjectId[];
  description: string;
  createdBy: ObjectId;
  clientId: ObjectId;
  isCompleted: boolean;
  feedback: ObjectId;
  isDeleted: boolean;
}

const GoalSchema: Schema = new Schema({
  objectives: {
    type: [Schema.Types.ObjectId],
    ref: 'Objective',
    required: [true, 'The objectives are required'],
    trim: true,
    maxlength: [50, 'The objectives cannot exceed 50 characters']
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
    required: [true, 'The createdBy is required']
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'The clientId is required']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: Schema.Types.ObjectId,
    ref: 'Feedback',
    required: [true, 'The feedback is required']
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

GoalSchema.index({ objectives: 1 });
GoalSchema.index({ createdBy: 1 });
GoalSchema.index({ clientId: 1 });
GoalSchema.index({ isCompleted: 1 });
GoalSchema.index({ feedback: 1 });

export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema); 