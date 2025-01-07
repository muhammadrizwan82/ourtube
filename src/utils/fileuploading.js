import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env.sample'
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadonCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: "ourtube/library/",  // Corrected option to 'folder'
            resource_type: "auto"
        });

        console.log('File has been uploaded on Cloudinary:', response.url);
        return response;
    } catch (error) {
        console.error('Cloudinary file upload error:', error);
        try {
            await fs.promises.unlink(localFilePath);  // Async file removal
        } catch (unlinkError) {
            console.error('Error removing local file:', unlinkError);
        }
        return null;
    }
};

export { uploadonCloudinary };
