import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes';
import parcelRoutes from './modules/parcel/parcel.routes';
import userRoutes from './modules/user/user.routes';
import publicRoutes from './modules/parcel/public.routes'

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-project-namesssssdds.surge.sh",
    "https://your-netlify-project.netlify.app"
  ],
  credentials: true,
}));
  
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/public', publicRoutes);

export default app;
