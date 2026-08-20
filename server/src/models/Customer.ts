import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  branchId: mongoose.Types.ObjectId;
  name: string;
  nameAr?: string;
  phone: string;
  email?: string;
  address?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: Date;
  iqamaNumber?: string;
  iqamaExpiry?: Date;
  profession?: string;
  totalTransactions: number;
  totalSpent: number;
  lastVisit?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    name: { type: String, required: true },
    nameAr: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    nationality: { type: String },
    passportNumber: { type: String },
    passportExpiry: { type: Date },
    iqamaNumber: { type: String },
    iqamaExpiry: { type: Date },
    profession: { type: String },
    totalTransactions: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastVisit: { type: Date },
  },
  { timestamps: true }
);

CustomerSchema.index({ branchId: 1 });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ name: 'text' });

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
