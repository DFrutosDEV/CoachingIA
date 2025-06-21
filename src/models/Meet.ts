import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IMeet extends Document {
  date: Date;
  time: string;
  link: string;
  createdBy: ObjectId;
  participants: ObjectId[];
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
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
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
MeetSchema.index({ participants: 1 });
MeetSchema.index({ isCancelled: 1 });

export default mongoose.models.Meet || mongoose.model<IMeet>('Meet', MeetSchema); 