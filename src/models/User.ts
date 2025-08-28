import mongoose, { Document, Schema} from 'mongoose';

export interface IUser extends Document {
  password: string;
  email: string;
  firstLogin: boolean;
  isDeleted: boolean;
}

const UserSchema: Schema = new Schema({
  password: {
    type: String,
    required: [true, 'The password is required'],
    trim: true,
    maxlength: [50, 'The password cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'The email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  firstLogin: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

UserSchema.index({ email: 1, isDeleted: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 