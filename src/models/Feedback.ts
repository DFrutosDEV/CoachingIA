import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  userId: string;
  coachId: string;
  clientId: string;
  enterpriseId: string;
  feedback: string;
}

const FeedbackSchema: Schema = new Schema({
  userId: {
    type: String,
    required: [true, 'The userId is required'],
    trim: true,
    maxlength: [50, 'The userId cannot exceed 50 characters']
  },
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
  feedback: {
    type: String,
    required: [true, 'The feedback is required'],
    trim: true,
    maxlength: [500, 'The feedback cannot exceed 500 characters']
  },
}, {
  timestamps: true
});

FeedbackSchema.index({ userId: 1 });

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema); 