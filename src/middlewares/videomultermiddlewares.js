const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/temp");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["video/mp4", "video/mkv", "video/avi", "video/mov"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only videos are allowed!"), false);
    }
};
const uploads = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // Limit: 100MB
});

module.exports = uploads;
