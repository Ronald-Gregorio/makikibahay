import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/makikibahay';
  const DB_NAME = process.env.MONGODB_DB_NAME || 'makikibahay';

  console.log(`Attempting to connect to MongoDB: ${MONGODB_URI.split('@')[1] || MONGODB_URI} (DB: ${DB_NAME})`);
  const startTime = Date.now();
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`Connected to MongoDB successfully: ${DB_NAME} (took ${Date.now() - startTime}ms)`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});