import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  coachId: string;
  clientId: string;
  objectiveId: string;
  feedback: string;
}

const FeedbackSchema: Schema = new Schema({
  coachId: {
    type: String,
    required: [true, 'The coachId is required'],
    trim: true,
    maxlength: [50, 'The coachId cannot exceed 50 characters']
  },
  clientId: {
    type: String,
    required: [true, 'The clientId is required'],
    trim: true,
    maxlength: [50, 'The clientId cannot exceed 50 characters']
  },
  enterpriseId: {
    type: String,
    required: [true, 'The enterpriseId is required'],
    trim: true,
    maxlength: [50, 'The enterpriseId cannot exceed 50 characters']
  },
  objectiveId: {
    type: String,
    required: [true, 'The objectiveId is required'],
    trim: true,
    maxlength: [50, 'The objectiveId cannot exceed 50 characters']
  },
  feedback: {
    type: String,
    required: [true, 'The feedback is required'],
    trim: true,
    maxlength: [500, 'The feedback cannot exceed 500 characters']
  },
}, {
  timestamps: true
});

FeedbackSchema.index({ coachId: 1 });
FeedbackSchema.index({ clientId: 1 });
FeedbackSchema.index({ objectiveId: 1 });

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema); 