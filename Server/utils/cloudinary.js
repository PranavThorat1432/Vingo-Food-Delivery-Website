import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs';

const uploadOnCloudinary = async (filePath) => {
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_API_KEY, 
        api_secret: process.env.CLOUD_API_SECRET
    });

    try {
        const result = await cloudinary.uploader.upload(filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // clean up local temp file
        }
        return result.secure_url;
    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

export default uploadOnCloudinary;