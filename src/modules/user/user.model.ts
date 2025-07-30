import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'sender', 'receiver'], default: 'sender' },
  isBlocked: { type: Boolean, default: false },
});

export default mongoose.model('User', userSchema);
