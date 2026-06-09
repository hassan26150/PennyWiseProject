const multer = require('multer');

// Use MemoryStorage so the file is available as a buffer (req.file.buffer)
// This avoids writing the file to disk before uploading to Cloudinary
const storage = multer.memoryStorage();

// File validation
const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
