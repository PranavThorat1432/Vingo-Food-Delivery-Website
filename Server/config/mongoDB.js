import mongoose from "mongoose";

//MongoDB Connection
const connectDB = async () => {
    mongoose.connect( process.env.MONGODB_URL, {
        dbName: "Vingo_Food_Delivery"
    }).then(() => {
        console.log("MongoDB Connected..!");
    }).catch((err) => {
        console.log(err);
    });
};


export default connectDB;