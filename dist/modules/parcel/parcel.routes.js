"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const parcel_controller_1 = require("./parcel.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const parcel_controller_2 = require("./parcel.controller");
const router = express_1.default.Router();
// sender routes
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('sender'), parcel_controller_1.createParcel);
router.get('/me', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('sender'), parcel_controller_1.getMyParcels);
router.patch('/cancel/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('sender'), parcel_controller_1.cancelParcel);
// reciver routes
router.get('/incoming', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('receiver'), parcel_controller_1.getIncomingParcels);
router.get('/delivered', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('receiver'), parcel_controller_1.getDeliveryHistory);
router.patch('/confirm/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('receiver'), parcel_controller_1.confirmDelivery);
// admin routes
router.patch('/status/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('admin'), parcel_controller_2.updateParcelStatus);
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('admin'), parcel_controller_1.getAllParcels);
exports.default = router;
