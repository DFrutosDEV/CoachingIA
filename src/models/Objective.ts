import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IObjective extends Document {
  title: string;
  createdBy: ObjectId;
  clientId: ObjectId;
  startDate: Date;
  endDate: Date;
  feedback?: string;
  coachId: ObjectId;
  isCompleted: boolean;
  active: boolean;
  configFile: {
    question: string;
    answer: string;
  }[];
  aiConfig?: {
    voiceTone: string;
    difficultyLevel: string;
    challengeTypes: string;
    includeWeekends: boolean;
    pdaFileId?: ObjectId;
  };
}

const ObjectiveSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'The title is required'],
      trim: true,
      maxlength: [50, 'The title cannot exceed 50 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'The startDate is required'],
    },
    endDate: {
      type: Date,
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'The createdBy is required'],
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'The clientId is required'],
    },
    feedback: {
      type: String,
      trim: true,
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'The coachId is required'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    configFile: {
      type: [
        {
          question: String,
          answer: String,
        },
      ],
      default: [],
    },
    aiConfig: {
      voiceTone: {
        type: String,
        enum: ['formal', 'casual', 'motivational', 'supportive'],
        default: 'supportive',
      },
      difficultyLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate',
      },
      challengeTypes: {
        type: String,
        enum: ['physical', 'mental', 'emotional', 'social', 'mixed'],
        default: 'mixed',
      },
      includeWeekends: {
        type: Boolean,
        default: false,
      },
      pdaFileId: {
        type: Schema.Types.ObjectId,
        ref: 'Pda',
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

ObjectiveSchema.index({ title: 1 });
ObjectiveSchema.index({ createdBy: 1 });
ObjectiveSchema.index({ startDate: 1 });
ObjectiveSchema.index({ endDate: 1 });
ObjectiveSchema.index({ clientId: 1 });
ObjectiveSchema.index({ isCompleted: 1 });
ObjectiveSchema.index({ active: 1 });

export default mongoose.models.Objective ||
  mongoose.model<IObjective>('Objective', ObjectiveSchema);
