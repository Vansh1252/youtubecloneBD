const cloudinary = require('cloudinary').v2;
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
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

const extractPublicId = (imageUrl) => {
    try {
        const parts = imageUrl.split("/");
        const filename = parts.pop().split(".")[0]; // Extract filename without extension
        return filename;
    } catch (error) {
        console.error("Error extracting public ID:", error);
        return null;
    }
};



const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        console.log("Old avatar deleted successfully.");
    } catch (error) {
        console.error("Error deleting old avatar:", error);
    }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary, extractPublicId };