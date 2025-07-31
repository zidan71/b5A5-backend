"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const user_controller_1 = require("./user.controller");
const router = express_1.default.Router();
// Admin-only routes
router.get('/dashboard', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('admin'), user_controller_1.getAdminDashboard);
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('admin'), user_controller_1.getAllUsers);
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('admin'), user_controller_1.getSingleUser);
router.patch('/block/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('admin'), user_controller_1.blockUser);
router.patch('/unblock/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('admin'), user_controller_1.unblockUser);
exports.default = router;
