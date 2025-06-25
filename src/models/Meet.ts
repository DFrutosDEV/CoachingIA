import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IMeet extends Document {
  date: Date;
  time: string;
  link: string;
  createdBy: ObjectId;
  clientId: ObjectId;
  coachId: ObjectId;
  objectiveId: ObjectId;
  isCancelled: boolean;
}

const MeetSchema: Schema = new Schema({
  date: {
    type: Date,
    required: [true, 'The date is required'],
    trim: true,
  },
  time: {
    type: String,
    required: [true, 'The time is required'],
    trim: true,
  },
  link: {
    type: String,
    required: [true, 'The link is required'],
    trim: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'The clientId is required']
  },
  coachId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'The coachId is required']
  },
  objectiveId: {
    type: Schema.Types.ObjectId,
    ref: 'Objective',
    required: [true, 'The objectiveId is required']
  },
  isCancelled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

MeetSchema.index({ date: 1 });
MeetSchema.index({ time: 1 });
MeetSchema.index({ createdBy: 1 });
MeetSchema.index({ clientId: 1 });
MeetSchema.index({ coachId: 1 });
MeetSchema.index({ isCancelled: 1 });
MeetSchema.index({ objectiveId: 1 });

export default mongoose.models.Meet || mongoose.model<IMeet>('Meet', MeetSchema); 