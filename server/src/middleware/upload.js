const multer = require("multer");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, png, webp, gif)"), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// Single photo — profile and feed
const uploadSingle = upload.single("photo");

// 3 named photo slots for heist dossier sections B, C, D
const uploadHeistPhotos = upload.fields([
  { name: "phase1_photo", maxCount: 1 },
  { name: "execution_photo", maxCount: 1 },
  { name: "extraction_photo", maxCount: 1 },
]);

module.exports = { uploadSingle, uploadHeistPhotos };