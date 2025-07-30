import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const port = 5000;

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ytuhl.mongodb.net/parcel-backend?retryWrites=true&w=majority&appName=Cluster0`)
  .then(() => {
    console.log('✅ DB connected');
    app.listen(port, () => console.log(`🚀 Running at http://localhost:${port}`));
  })
  .catch(err => console.error('DB connection failed', err));