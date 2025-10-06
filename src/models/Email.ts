import mongoose, { Schema, Document } from 'mongoose';

export interface IEmail extends Document {
  to: string;
  subject: string;
  html: string;
  createdAt: Date;
  sendDate: Date;
  status: 'pending' | 'sent' | 'failed';
  errorMessage?: string;
  sentAt?: Date;
  retryCount: number;
  maxRetries: number;
}

const EmailSchema: Schema = new Schema(
  {
    to: {
      type: String,
      required: [true, 'Email destinatario es requerido'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    },
    subject: {
      type: String,
      required: [true, 'Asunto es requerido'],
      trim: true,
      maxlength: [200, 'El asunto no puede exceder 200 caracteres'],
    },
    html: {
      type: String,
      required: [true, 'Contenido HTML es requerido'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    sendDate: {
      type: Date,
      required: [true, 'Fecha de envío es requerida'],
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
      min: 1,
    },
  },
  {
    timestamps: true,
    collection: 'emails',
  }
);

// Índices para optimizar las consultas
EmailSchema.index({ sendDate: 1, status: 1 });
EmailSchema.index({ createdAt: 1 });
EmailSchema.index({ status: 1 });

// Método para marcar como enviado
EmailSchema.methods.markAsSent = function () {
  this.status = 'sent';
  this.sentAt = new Date();
  this.errorMessage = null;
};

// Método para marcar como fallido
EmailSchema.methods.markAsFailed = function (errorMessage: string) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.retryCount += 1;
};

// Método para verificar si se puede reintentar
EmailSchema.methods.canRetry = function (): boolean {
  return this.retryCount < this.maxRetries;
};

export default mongoose.models.Email ||
  mongoose.model<IEmail>('Email', EmailSchema);
