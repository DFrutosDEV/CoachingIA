import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IEnterprise extends Document {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  socialMedia: string[];
  active: boolean;
  isDeleted: boolean;
  points: number;
}

const EnterpriseSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'The name cannot exceed 100 characters'],
    },
    logo: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: [100, 'The address cannot exceed 100 characters'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [10, 'The phone cannot exceed 10 characters'],
      default: '',
    },
    email: {
      type: String,
      trim: true,
      maxlength: [100, 'The email cannot exceed 100 characters'],
      default: '',
    },
    website: {
      type: String,
      trim: true,
      maxlength: [100, 'The website cannot exceed 100 characters'],
      default: '',
    },
    socialMedia: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

EnterpriseSchema.index({ name: 1 });
EnterpriseSchema.index({ isDeleted: 1 });

export default mongoose.models.Enterprise ||
  mongoose.model<IEnterprise>('Enterprise', EnterpriseSchema);
