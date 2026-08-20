import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  code: string;
  name: string;
  nameAr?: string;
  city?: string;
  country?: 'SA' | 'BD';
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  isHeadOffice: boolean;
  status: 'active' | 'inactive';
  managerName?: string;
  managerPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    nameAr: { type: String },
    city: { type: String },
    country: { type: String, enum: ['SA', 'BD'], default: 'SA' },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    isActive: { type: Boolean, default: true },
    isHeadOffice: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    managerName: { type: String },
    managerPhone: { type: String },
  },
  { timestamps: true }
);

BranchSchema.index({ code: 1 });
BranchSchema.index({ status: 1 });

export const Branch = mongoose.model<IBranch>('Branch', BranchSchema);
