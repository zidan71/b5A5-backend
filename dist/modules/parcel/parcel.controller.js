"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFee = exports.trackParcelPublic = exports.getAllParcels = exports.updateParcelStatus = exports.getDeliveryHistory = exports.getIncomingParcels = exports.confirmDelivery = exports.cancelParcel = exports.getMyParcels = exports.createParcel = void 0;
const parcel_model_1 = require("./parcel.model");
const mongoose_1 = __importStar(require("mongoose"));
const createParcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiver, type, weight, deliveryAddress } = req.body;
    const trackingId = `TRK-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    const parcel = yield parcel_model_1.Parcel.create({
        sender: req.user._id,
        receiver,
        type,
        weight,
        deliveryAddress,
        trackingId,
        fee: weight * 10,
        statusLog: [{ status: 'Requested', updatedBy: req.user.id }],
    });
    res.status(201).json({ message: 'Parcel created', parcel });
});
exports.createParcel = createParcel;
const getMyParcels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        let parcels;
        if (role === "sender") {
            parcels = yield parcel_model_1.Parcel.find({ sender: userId })
                .populate("receiver", "name email")
                .sort({ createdAt: -1 });
        }
        else if (role === "receiver") {
            parcels = yield parcel_model_1.Parcel.find({ receiver: userId })
                .populate("sender", "name email")
                .sort({ createdAt: -1 });
        }
        else {
            return res.status(403).json({ message: "Invalid role" });
        }
        res.status(200).json({ message: "Your parcels", parcels });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch parcels", error });
    }
});
exports.getMyParcels = getMyParcels;
const cancelParcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const parcelId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!mongoose_1.Types.ObjectId.isValid(parcelId)) {
            return res.status(400).json({ message: 'Invalid parcel ID format.' });
        }
        const parcel = yield parcel_model_1.Parcel.findById(parcelId);
        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found.' });
        }
        if (parcel.sender.toString() !== (userId === null || userId === void 0 ? void 0 : userId.toString())) {
            return res.status(403).json({ message: 'You are not allowed to cancel this parcel.' });
        }
        if (parcel.currentStatus !== 'Requested') {
            return res.status(400).json({ message: 'Parcel cannot be cancelled at this stage.' });
        }
        parcel.currentStatus = 'Cancelled';
        parcel.canceled = true;
        parcel.statusLog.push({
            status: 'Cancelled',
            updatedBy: userId,
            timestamp: new Date(),
            note: 'Cancelled by sender',
        });
        yield parcel.save();
        return res.status(200).json({
            message: 'Parcel cancelled successfully.',
            parcel,
        });
    }
    catch (err) {
        console.error('Error cancelling parcel:', err);
        return res.status(500).json({ message: 'Something went wrong.', error: err });
    }
});
exports.cancelParcel = cancelParcel;
const confirmDelivery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const parcelId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!mongoose_1.Types.ObjectId.isValid(parcelId)) {
            return res.status(400).json({ message: 'Invalid parcel ID.' });
        }
        const parcel = yield parcel_model_1.Parcel.findById(parcelId);
        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found.' });
        }
        if (parcel.receiver.toString() !== (userId === null || userId === void 0 ? void 0 : userId.toString())) {
            return res.status(403).json({ message: 'You are not authorized to confirm delivery for this parcel.' });
        }
        if (!['Dispatched', 'In Transit'].includes(parcel.currentStatus)) {
            return res.status(400).json({ message: `Parcel cannot be confirmed delivered at this status: ${parcel.currentStatus}` });
        }
        parcel.currentStatus = 'Delivered';
        parcel.statusLog.push({
            status: 'Delivered',
            updatedBy: userId,
            timestamp: new Date(),
            note: 'Confirmed delivery by receiver',
        });
        yield parcel.save();
        return res.status(200).json({ message: 'Delivery confirmed successfully.', parcel });
    }
    catch (error) {
        console.error('Error confirming delivery:', error);
        return res.status(500).json({ message: 'Something went wrong.', error });
    }
});
exports.confirmDelivery = confirmDelivery;
const getIncomingParcels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const parcels = yield parcel_model_1.Parcel.find({
            receiver: userId,
            currentStatus: { $ne: 'Delivered' }, // 👈 exclude Delivered
        })
            .populate('sender', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(parcels);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch incoming parcels', error: err });
    }
});
exports.getIncomingParcels = getIncomingParcels;
const getDeliveryHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const deliveredParcels = yield parcel_model_1.Parcel.find({
            receiver: userId,
            currentStatus: 'Delivered',
        });
        res.status(200).json({ parcels: deliveredParcels });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch delivery history', error: err });
    }
});
exports.getDeliveryHistory = getDeliveryHistory;
const updateParcelStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { status, note } = req.body;
    const parcelId = req.params.id;
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel)
        return res.status(404).json({ message: 'Parcel not found' });
    parcel.currentStatus = status;
    parcel.statusLog.push({
        status,
        note,
        updatedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
        timestamp: new Date(),
    });
    yield parcel.save();
    res.json({ message: 'Status updated', parcel });
});
exports.updateParcelStatus = updateParcelStatus;
const getAllParcels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, userId, search = "", page = "1", limit = "10" } = req.query;
        const filter = {};
        if (status)
            filter.currentStatus = status;
        const orConditions = [];
        if (userId && mongoose_1.default.Types.ObjectId.isValid(userId)) {
            orConditions.push({ sender: userId }, { receiver: userId });
        }
        if (search) {
            orConditions.push({ trackingId: { $regex: search, $options: "i" } }, { "sender.name": { $regex: search, $options: "i" } }, { "sender.email": { $regex: search, $options: "i" } }, { "receiver.name": { $regex: search, $options: "i" } }, { "receiver.email": { $regex: search, $options: "i" } });
        }
        if (orConditions.length)
            filter.$or = orConditions;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;
        const parcels = yield parcel_model_1.Parcel.find(filter)
            .populate("sender", "name email")
            .populate("receiver", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = yield parcel_model_1.Parcel.countDocuments(filter);
        res.status(200).json({
            parcels,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        console.error("Error fetching parcels:", error);
        res.status(500).json({ message: "Failed to get parcels" });
    }
});
exports.getAllParcels = getAllParcels;
const trackParcelPublic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trackingId } = req.params;
        const parcel = yield parcel_model_1.Parcel.findOne({ trackingId: new RegExp(`^${trackingId}$`, 'i') })
            .populate('sender', 'name email')
            .populate('receiver', 'name email');
        if (!parcel) {
            return res.status(404).json({ message: 'Parcel not found' });
        }
        res.json(parcel);
    }
    catch (error) {
        console.error('Error in public tracking:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.trackParcelPublic = trackParcelPublic;
const calculateFee = (req, res) => {
    const weight = parseFloat(req.query.weight);
    const distance = parseFloat(req.query.distance) || 10;
    if (isNaN(weight) || weight <= 0) {
        return res.status(400).json({ message: 'Weight must be a positive number' });
    }
    const baseFee = 10;
    const fee = baseFee + weight * 5 + distance * 2;
    res.json({ estimatedFee: fee });
};
exports.calculateFee = calculateFee;
