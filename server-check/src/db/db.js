import mongoose from "mongoose";

async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected at: ", conn.connection.host);
    } catch (error) {
        console.log("DB connection error:", error.message);
        process.exit(1);
    }
}

export default connectDB;