import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IEnterprise extends Document {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  socialMedia: string[];
  coaches: string[];
  employees: string[];
  active: boolean;
  isDeleted: boolean;
}

const EnterpriseSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'The name cannot exceed 100 characters'],
  },
  logo: {
    type: String,
    default: ''
  },  
  address: {
    type: String,
    trim: true,
    maxlength: [100, 'The address cannot exceed 100 characters'],
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [10, 'The phone cannot exceed 10 characters'],
    default: ''
  },
  email: {
    type: String,
    trim: true,
    maxlength: [100, 'The email cannot exceed 100 characters'],
    default: ''
  },
  website: {
    type: String,
    trim: true,
    maxlength: [100, 'The website cannot exceed 100 characters'],
    default: ''
  },
  socialMedia: {
    type: [String],
    default: []
  },
  coaches: {
    type: [String],
    default: []
  },
  employees: {
    type: [String],
    default: []
  },
  active: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

EnterpriseSchema.index({ name: 1 });
EnterpriseSchema.index({ isDeleted: 1 });
EnterpriseSchema.index({ coaches: 1 });
EnterpriseSchema.index({ employees: 1 });

export default mongoose.models.Enterprise || mongoose.model<IEnterprise>('Enterprise', EnterpriseSchema); 