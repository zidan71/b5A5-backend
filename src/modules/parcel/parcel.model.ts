import mongoose from 'mongoose';

const statusLogSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Requested', 'Approved', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled'],
    required: true,
  },
  note: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
});

const parcelSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  weight: { type: Number, required: true },
  fee: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  currentStatus: {
    type: String,
    enum: ['Requested', 'Approved', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Requested',
  },
  statusLog: [statusLogSchema], // ✅ renamed from statusLogs → statusLog
  blocked: { type: Boolean, default: false },
  canceled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Parcel = mongoose.model('Parcel', parcelSchema);
