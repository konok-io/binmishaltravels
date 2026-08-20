import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'super_admin' | 'branch_manager' | 'branch_staff';

export interface IPermission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  nameAr?: string;
  phone?: string;
  role: UserRole;
  branchId?: mongoose.Types.ObjectId;
  permissions: IPermission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const PermissionSchema = new Schema<IPermission>({
  resource: { type: String, required: true },
  actions: [{
    type: String,
    enum: ['create', 'read', 'update', 'delete']
  }]
}, { _id: false });

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true },
    nameAr: { type: String },
    phone: { type: String },
    role: { 
      type: String, 
      enum: ['super_admin', 'branch_manager', 'branch_staff'], 
      required: true 
    },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    permissions: [PermissionSchema],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    delete ret.password;
    return ret;
  }
});

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ branchId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
