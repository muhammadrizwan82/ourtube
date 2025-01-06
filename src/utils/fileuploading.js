import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: 'ourtube',
    api_key: '684932722287616',
    api_secret: 'myInwm4zwEqMJU_YwgFdNTRHKlc'
});

console.log('CLOUDINARY_CLOUD_NAME', process.env.CLOUDINARY_CLOUD_NAME)
console.log('CLOUDINARY_API_KEY', process.env.CLOUDINARY_API_KEY)
console.log('CLOUDINARY_API_SECRET', process.env.CLOUDINARY_API_SECRET)

const uploadonCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            asset_folder: "ourtube/library/",
            resource_type: "auto"
        })
        //file has been uploaded
        console.log('file has been uploaded on cloudinary', response.url)
        return response
    } catch (error) {
        console.log('Cloudinary file upload error', error)
        //fs.unlinkSync(localFilePath) /*Remove the locally Save File*/
        return null
    }
}
export { uploadonCloudinary };