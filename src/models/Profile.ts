import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IProfile extends Document {
  user: ObjectId;
  role: ObjectId;
  profilePicture: string;
  bio: string;  
  isDeleted: boolean;
}

const ProfileSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'The bio cannot exceed 500 characters'],
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

ProfileSchema.index({ user: 1 });
ProfileSchema.index({ isDeleted: 1 });

export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema); 