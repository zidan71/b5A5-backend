"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const parcel_controller_1 = require("./parcel.controller");
const router = express_1.default.Router();
router.get('/calculate-fee', parcel_controller_1.calculateFee);
router.get('/track/:trackingId', parcel_controller_1.trackParcelPublic);
exports.default = router;
