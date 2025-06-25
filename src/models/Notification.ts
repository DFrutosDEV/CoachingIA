import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface INotification extends Document {
  title: string;
  description: string;
  createdBy: ObjectId;
  coachId: ObjectId;
  clientId: ObjectId;
  read: boolean;
}

const NotificationSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'The title is required'],
    trim: true,
    maxlength: [50, 'The title cannot exceed 50 characters']
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
    required: true
  },
  coachId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

NotificationSchema.index({ title: 1 });
NotificationSchema.index({ clientId: 1 });
NotificationSchema.index({ read: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema); 