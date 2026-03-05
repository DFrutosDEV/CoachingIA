import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface INotification extends Document {
  title: string;
  description: string;
  createdAt: Date;
  profileIdRecipients: ObjectId[];
  profileIdSender: ObjectId;
  profileIdRead: ObjectId[];
}

const NotificationSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'The title is required'],
      trim: true,
      maxlength: [50, 'The title cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'The description is required'],
      trim: true,
      maxlength: [500, 'The description cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    profileIdRecipients: {
      type: [Schema.Types.ObjectId],
      ref: 'Profile',
      required: true,
    },
    profileIdSender: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    profileIdRead: {
      type: [Schema.Types.ObjectId],
      ref: 'Profile',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ title: 1 });
NotificationSchema.index({ profileIdRecipients: 1 });
NotificationSchema.index({ profileIdSender: 1 });
NotificationSchema.index({ profileIdRead: 1 });

export default mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
