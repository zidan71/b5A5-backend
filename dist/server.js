"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
const port = 5000;
app_1.default.get('/', (req, res) => {
    res.send("Welcome to parcel Delivery api");
});
mongoose_1.default.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ytuhl.mongodb.net/parcel-backend?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
    console.log('✅ DB connected');
    app_1.default.listen(port, () => console.log(`🚀 Running at http://localhost:${port}`));
})
    .catch(err => console.error('DB connection failed', err));
