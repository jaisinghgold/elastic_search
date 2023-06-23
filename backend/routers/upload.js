const express = require("express");

// Import the upload controller
const uploadController = require("../controller/uploadctrl");

const router = express.Router();

// Import multer and create an upload instance
const multer = require("multer");
const upload = multer();

// Define routes and their corresponding controller functions
router.post("/upload", upload.single("csvFile"), uploadController.uploadData);

module.exports = router;
