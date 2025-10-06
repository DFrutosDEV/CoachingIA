import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IPda extends Document {
  profile: ObjectId;
  fileName: string;
  fileData: Buffer;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  isDeleted: boolean;
}

const PdaSchema: Schema = new Schema(
  {
    profile: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    fileName: {
      type: String,
      required: [true, 'El nombre del archivo es requerido'],
      trim: true,
    },
    fileData: {
      type: Buffer,
      required: [true, 'Los datos del archivo son requeridos'],
    },
    fileSize: {
      type: Number,
      required: [true, 'El tamaño del archivo es requerido'],
      min: [1, 'El tamaño del archivo debe ser mayor a 0'],
    },
    mimeType: {
      type: String,
      required: [true, 'El tipo MIME es requerido'],
      default: 'application/pdf',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para optimizar consultas
PdaSchema.index({ profile: 1, isDeleted: 1 });
PdaSchema.index({ uploadedAt: -1 });

export default mongoose.models.Pda || mongoose.model<IPda>('Pda', PdaSchema);
