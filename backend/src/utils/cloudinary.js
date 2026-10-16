import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises'


// CLOUDINARY CONFIGURATION
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

// FILE UPLOAD ON CLOUDINARY
const uploadOnCloudinary = async function(localFilePath) {
    if(!localFilePath) return null

    try {
        return await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
    } finally {
        await fs.unlink(localFilePath).catch((error) => {
            if (error.code !== "ENOENT") throw error;
        });
    }
}
export { uploadOnCloudinary }
