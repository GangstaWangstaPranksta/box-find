import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const clientOptions = {
	serverApi: { version: '1' as const, strict: true, deprecationErrors: true }
};

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, clientOptions);
		//console.log('MongoDB connected');
	} catch (error) {
		console.error('MongoDB connection error:', error);
		process.exit(1);
	}
};

export default connectDB;
