import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


// CLOUDINARY CONFIGURATION
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

// FILE UPLOAD ON CLOUDINARY
const uploadOnCloudinary = async function(localFilePath) {
    try {
        if(!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: auto
        })

        console.log("File uploaded successfully!! ", response.url);
        return response
        
    } catch (error) {
        fs.unlink(localFilePath) // REMOVE THE LOCALLY SAVED TEMP FILE AS UPLOAD OPRATION GOT FAILED
        return error
    }
    
}
export { uploadOnCloudinary }
