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
        return null;
    }
    finally {
        try {
            console.log('localFilePath', localFilePath);
            await fs.promises.unlink(localFilePath);  // Async file removal
        } catch (unlinkError) {
            console.error('Error removing local file:', unlinkError);
        }
    }
};

const deleteFromCloudinary = async (imageUrl) => {  // Added function to delete files from Cloudinary   
    try {
        if (!imageUrl) return null;
        const response = await cloudinary.uploader.destroy(imageUrl, {
            resource_type: "image"  // Corrected option to 'resource_type'
        });
        console.log('File has been deleted from Cloudinary:', response.result);
        return true;
    } catch (error) {
        console.error('Cloudinary file delete error:', error);
        return false;
    }
}

export { uploadonCloudinary, deleteFromCloudinary };
