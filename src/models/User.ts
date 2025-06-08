import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IUser extends Document {
  name: string;
  lastName: string;
  password: string;
  roles: ObjectId[];
  email: string;
  age?: number;
  creationDate: Date;
  active: boolean;
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
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

UserSchema.index({ name: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 