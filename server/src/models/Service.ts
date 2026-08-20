import mongoose, { Schema, Document } from 'mongoose';

export type ServiceCategory = 
  | 'air_ticket'
  | 'cargo'
  | 'iqama'
  | 'visa'
  | 'passport'
  | 'jawazat'
  | 'airport_print'
  | 'umrah';

export interface IService extends Document {
  code: string;
  name: string;
  nameBn: string;
  nameAr: string;
  category: ServiceCategory;
  icon: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    nameBn: { type: String, required: true },
    nameAr: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['air_ticket', 'cargo', 'iqama', 'visa', 'passport', 'jawazat', 'airport_print', 'umrah'],
      required: true 
    },
    icon: { type: String, default: '📋' },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ code: 1 });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ isActive: 1 });

export const Service = mongoose.model<IService>('Service', ServiceSchema);
