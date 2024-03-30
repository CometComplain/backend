import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        const mongoConnection = await mongoose.connect(process.env.MONGO_URL,{
            dbName:"CommetComplain"
        });
        console.log("-------> MongoDB connected <-------");
        console.log('Hosted at ', mongoConnection.connection.host);
        return mongoConnection;
    } catch (error) {
        console.error('-------> Connection Error <-------\n', error);
        process.exit(1);
    }
};
