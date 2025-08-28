import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IProfile extends Document {
  user: ObjectId;
  role: ObjectId;
  profilePicture: string;
  name: string;
  lastName: string;
  age?: number;
  bio: string;
  phone: string;
  address: string;
  indexDashboard: number[];
  clients: ObjectId[];
  enterprise: ObjectId;
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
  name: {
    type: String,
    required: [true, 'The name is required'],
    trim: true,
    maxlength: [50, 'The name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'The last name is required'],
    trim: true,
    maxlength: [50, 'The last name cannot exceed 50 characters']
  },
  age: {
    type: Number,
    min: [0, 'The age cannot be negative'],
    max: [120, 'The age cannot be greater than 120']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'The bio cannot exceed 500 characters'],
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  indexDashboard: {
    type: [Number],
    default: []
  },
  clients: {
    type: [Schema.Types.ObjectId],
    ref: 'Profile',
    default: []
  },
  enterprise: {
    type: Schema.Types.ObjectId,
    ref: 'Enterprise',
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

ProfileSchema.index({ user: 1, isDeleted: 1, role: 1 });

export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema); 