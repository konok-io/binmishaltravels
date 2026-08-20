import mongoose, { Schema, Document } from 'mongoose';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'due';

export interface IServiceDetails {
  // For Air Ticket
  route?: string;
  airline?: string;
  flightDate?: string;
  returnDate?: string;
  ticketNumber?: string;
  passengerName?: string;
  passengerType?: 'adult' | 'child' | 'infant';
  pnr?: string;
  seatClass?: 'economy' | 'business' | 'first';
  
  // For Cargo
  weight?: number;
  cargoType?: string;
  origin?: string;
  destination?: string;
  trackingNumber?: string;
  
  // For Visa
  visaType?: string;
  visaDuration?: string;
  entryDate?: string;
  exitDate?: string;
  visaNumber?: string;
  
  // For Iqama
  iqamaNumber?: string;
  profession?: string;
  sponsorName?: string;
  expiryDate?: string;
  renewalStatus?: string;
  
  // For Jawazat
  jawazatType?: string;
  printCount?: number;
  
  // For Umrah
  umrahPackage?: string;
  visaValidity?: string;
  hotelName?: string;
  
  // Common fields
  notes?: string;
  referenceNumber?: string;
}

export interface ITransaction extends Document {
  branchId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  
  serviceCode: string;
  serviceName: string;
  customerName: string;
  customerPhone?: string;
  customerPassport?: string;
  
  details: IServiceDetails;
  
  status: TransactionStatus;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  
  createdAt: Date;
  updatedAt: Date;
}

const ServiceDetailsSchema = new Schema<IServiceDetails>({}, { _id: false });

const TransactionSchema = new Schema<ITransaction>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    serviceCode: { type: String, required: true },
    serviceName: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    customerPassport: { type: String },
    
    details: { type: ServiceDetailsSchema, default: {} },
    
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending' 
    },
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    paymentStatus: { 
      type: String, 
      enum: ['paid', 'partial', 'due'],
      default: 'due' 
    },
  },
  { timestamps: true }
);

TransactionSchema.index({ branchId: 1 });
TransactionSchema.index({ customerId: 1 });
TransactionSchema.index({ serviceId: 1 });
TransactionSchema.index({ staffId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ paymentStatus: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
