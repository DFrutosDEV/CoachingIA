import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IUser extends Document {
  name: string;
  lastName: string;
  password: string;
  email: string;
  phone: string;
  age?: number;
  active: boolean;
  firstLogin: boolean;
  isDeleted: boolean;
  creationDate: Date;
}

const UserSchema: Schema = new Schema({
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
  password: {
    type: String,
    required: [true, 'The password is required'],
    trim: true,
    maxlength: [50, 'The password cannot exceed 50 characters']
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }],
  email: {
    type: String,
    required: [true, 'The email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'The phone cannot exceed 20 characters']
  },
  biography: {
    type: String,
    trim: true,
    maxlength: [500, 'The biography cannot exceed 500 characters']
  },
  profilePicture: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
    min: [0, 'The age cannot be negative'],
    max: [120, 'The age cannot be greater than 120']
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  firstLogin: {
    type: Boolean,
    default: true
  },
  clients: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  coaches: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  enterprises: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  indexDashboardClient: {
    type: [Number],
    default: []
  },
  indexDashboardCoach: {
    type: [Number],
    default: []
  },
  indexDashboardEnterprise: {
    type: [Number],
    default: []
  },
  indexDashboardAdmin: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

UserSchema.index({ name: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 