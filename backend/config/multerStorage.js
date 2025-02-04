const multer = require("multer");
const cloudinary = require("./cloudinaryConfig");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "artworks", // Folder in Cloudinary where files will be stored
    allowed_formats: ["jpeg", "jpg", "png"], // Allowable formats
    access_mode: "public",
  },
});

const upload = multer({ storage: storage });

module.exports = upload;