import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface INotification extends Document {
  title: string;
  description: string;
  createdAt: Date;
  userIdRecipients: ObjectId[];
  userIdSender: ObjectId;
  userIdRead: ObjectId[];
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  userIdRecipients: {
    type: [Schema.Types.ObjectId],
    ref: 'Profile',
    required: true
  },
  userIdSender: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  userIdRead: {
    type: [Schema.Types.ObjectId],
    ref: 'Profile',
    default: []
  }
}, {
  timestamps: true
});

NotificationSchema.index({ title: 1 });
NotificationSchema.index({ userIdRecipients: 1 });
NotificationSchema.index({ userIdSender: 1 });
NotificationSchema.index({ userIdRead: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema); 