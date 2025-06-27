import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface ITicket extends Document {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: ObjectId[];
  createdBy: ObjectId;
  creationDate: Date;
}

const TicketSchema: Schema = new Schema({
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
  status: {
    type: Boolean,
    required: [true, 'The status is required'],
    default: 'open',
    enum: ['open', 'in_progress', 'closed']
  },
  priority: {
    type: String,
    required: [true, 'The priority is required'],
    trim: true,
    maxlength: [50, 'The priority cannot exceed 50 characters'],
    enum: ['low', 'medium', 'high']
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: false
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: false
  },
  creationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

TicketSchema.index({ title: 1 });
TicketSchema.index({ status: 1 });

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema); 