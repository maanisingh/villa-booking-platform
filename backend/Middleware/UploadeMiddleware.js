// MIDDLEWARE/UPLOADMIDDLE.JS

const multer = require("multer");
const path = require("path");

// Set up where to store files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Allow only images
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only .jpg, .jpeg, .png formats are allowed!"), false);
};

// ✅ Create multer instance
const upload = multer({ storage, fileFilter });

// ✅ Export the instance correctly
module.exports = upload;
