"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const statusLogSchema = new mongoose_1.default.Schema({
    status: {
        type: String,
        enum: ['Requested', 'Approved', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled'],
        required: true,
    },
    note: String,
    updatedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
});
const parcelSchema = new mongoose_1.default.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true,
    },
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    weight: { type: Number, required: true },
    fee: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    currentStatus: {
        type: String,
        enum: ['Requested', 'Approved', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled'],
        default: 'Requested',
    },
    statusLog: [statusLogSchema],
    blocked: { type: Boolean, default: false },
    canceled: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
exports.Parcel = mongoose_1.default.model('Parcel', parcelSchema);
