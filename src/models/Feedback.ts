import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IFeedback extends Document {
  coachId: ObjectId;
  clientId: ObjectId;
  objectiveId: ObjectId;
  feedback: string;
}

const FeedbackSchema: Schema = new Schema(
  {
    coachId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'The coachId is required'],
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'The clientId is required'],
    },
    objectiveId: {
      type: Schema.Types.ObjectId,
      ref: 'Objective',
      required: [true, 'The objectiveId is required'],
    },
    feedback: {
      type: String,
      required: [true, 'The feedback is required'],
      trim: true,
      maxlength: [500, 'The feedback cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

FeedbackSchema.index({ coachId: 1 });
FeedbackSchema.index({ clientId: 1 });
FeedbackSchema.index({ objectiveId: 1 });

export default mongoose.models.Feedback ||
  mongoose.model<IFeedback>('Feedback', FeedbackSchema);
