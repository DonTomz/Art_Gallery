const express = require("express");
const upload = require("../config/multerStorage");

const router = express.Router();

// Route for uploading images
router.post("/upload", upload.single("image"),(req,res) => {
    if(!req.file){
        return res.status(400).send("No file uploaded.");

    }
    //the uploaded file information is available in req.file
    res.status(200).json({
        message: "File uploaded successfully",
        file: req.file,
    });
});

module.exports = router;