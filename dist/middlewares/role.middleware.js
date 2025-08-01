"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...roles) => {
    return (req, res, next) => {
        var _a;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};
exports.authorize = authorize;
