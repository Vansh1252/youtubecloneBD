const cloudinary = require('cloudinary');
const fs = require('fs');
require('dotenv').config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// console.log(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.v2.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        if (fs.existsSync(localFilePath)) {
            fs.unlink(localFilePath, (err) => {
                if (err) {
                    console.error("Error deleting local file:", err);
                } else {
                    console.log("Local file deleted successfully.");
                }
            });
        }
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlink(localFilePath, (err) => {
                if (err) {
                    console.error("Error deleting local file:", err);
                } else {
                    console.log("Local file deleted successfully.");
                }
            });
        }

        console.error("Error uploading to Cloudinary:", error);
        return null;
    }
};


module.exports = uploadOnCloudinary;