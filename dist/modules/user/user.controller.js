"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboard = exports.unblockUser = exports.blockUser = exports.getSingleUser = exports.getAllUsers = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const parcel_model_1 = require("../parcel/parcel.model");
const getAllUsers = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.find().select('-password');
    res.json(users);
});
exports.getAllUsers = getAllUsers;
const getSingleUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(req.params.id).select('-password');
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    res.json(user);
});
exports.getSingleUser = getSingleUser;
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.default.findByIdAndUpdate(req.params.id, { isBlocked: true });
    res.json({ message: 'User blocked' });
});
exports.blockUser = blockUser;
const unblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.default.findByIdAndUpdate(req.params.id, { isBlocked: false });
    res.json({ message: 'User unblocked' });
});
exports.unblockUser = unblockUser;
const getAdminDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalParcels = yield parcel_model_1.Parcel.countDocuments();
        const pendingParcels = yield parcel_model_1.Parcel.countDocuments({ currentStatus: 'Requested' });
        const deliveredParcels = yield parcel_model_1.Parcel.countDocuments({ currentStatus: 'Delivered' });
        const cancelledParcels = yield parcel_model_1.Parcel.countDocuments({ currentStatus: 'Cancelled' });
        const activeUsers = yield user_model_1.default.countDocuments({ isBlocked: { $ne: true } });
        res.json({
            totalParcels,
            pendingParcels,
            deliveredParcels,
            cancelledParcels,
            activeUsers,
        });
    }
    catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Failed to load dashboard' });
    }
});
exports.getAdminDashboard = getAdminDashboard;
