const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require("ffmpeg-static");
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error('No local file path provided');
            return null;
        }
        if (!fs.existsSync(localFilePath)) {
            throw new Error('File not found');
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            use_filename: true,
            unique_filename: false,
            overwrite: true
        });
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

const extractPublicId = (url) => {
    if (!url) return null;

    try {
        const publicIdMatch = url.match(/\/(?:v\d+\/)?([^\.]+)/);
        return publicIdMatch ? publicIdMatch[1] : null;
    } catch (error) {
        console.error("Error extracting public ID:", error);
        return null;
    }
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        if (!publicId) {
            console.error('No public ID provided');
            return false;
        }
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        if (result.result !== 'ok') {
            throw new Error(`Cloudinary deletion failed: ${result.result}`);
        }

        console.log("Cloudinary file deleted successfully");
        return true;

    } catch (error) {
        console.error("Error deleting from Cloudinary:", error.message);
        return false;
    }
};
module.exports = {
    uploadOnCloudinary,
    deleteFromCloudinary,
    extractPublicId,
};