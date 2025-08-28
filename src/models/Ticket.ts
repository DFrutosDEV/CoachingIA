import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  _id: string;
  title: string;
  description: string;
  category: 'bug' | 'suggestion' | 'complaint' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  reporterUser: mongoose.Types.ObjectId;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  assignedTo?: mongoose.Types.ObjectId;
  response?: string;
  responseBy?: mongoose.Types.ObjectId;
  responseDate?: Date;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closedBy?: mongoose.Types.ObjectId;
}

const TicketSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['bug', 'suggestion', 'complaint', 'other'],
    default: 'other',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending',
    required: true
  },
  reporterUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reporterName: {
    type: String,
    required: true,
    trim: true
  },
  reporterEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  reporterPhone: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  responseBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  responseDate: {
    type: Date
  },
  attachments: [{
    type: String
  }],
  closedAt: {
    type: Date
  },
  closedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

TicketSchema.index({ status: 1, createdAt: -1 });
TicketSchema.index({ reporterUser: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ priority: 1 });

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
