// =====================================================
// FOODE - UPLOAD MIDDLEWARE
// =====================================================

const multer = require("multer");
const path = require("path");

// =====================================================
// STORAGE
// =====================================================

// Keep files in memory.
// Cloudinary can upload the buffer afterward.
const storage = multer.memoryStorage();

// =====================================================
// ALLOWED FILE TYPES
// =====================================================

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  const mimeType = String(
    file.mimetype || ""
  ).toLowerCase();

  const extension = path
    .extname(file.originalname || "")
    .toLowerCase();

  const validMimeType =
    ALLOWED_MIME_TYPES.includes(mimeType);

  const validExtension =
    ALLOWED_EXTENSIONS.includes(extension);

  if (validMimeType || validExtension) {
    return cb(null, true);
  }

  console.log("❌ Invalid image upload:", {
    field: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
  });

  return cb(
    new Error(
      "Only JPG, JPEG, PNG, and WEBP images are allowed"
    ),
    false
  );
};

// =====================================================
// MULTER INSTANCE
// =====================================================

const multerUpload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 2,
    fields: 20,
    parts: 30,
  },
});

// =====================================================
// SAFE UPLOAD ERROR HANDLER
// =====================================================

// This prevents Multer errors from returning a huge
// Express HTML error page to the React Native app.

const handleUploadError = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (error) => {
      if (!error) {
        return next();
      }

      console.error(
        "❌ Upload Error:",
        error
      );

      // Multer-specific errors
      if (
        error instanceof multer.MulterError
      ) {
        let message =
          "Image upload failed";

        switch (error.code) {
          case "LIMIT_FILE_SIZE":
            message =
              "Image size cannot exceed 5 MB";
            break;

          case "LIMIT_FILE_COUNT":
            message =
              "Maximum 2 images are allowed";
            break;

          case "LIMIT_UNEXPECTED_FILE":
            message =
              `Unexpected image field: ${error.field}`;
            break;

          case "LIMIT_PART_COUNT":
            message =
              "Too many multipart form fields";
            break;

          default:
            message =
              error.message ||
              "Image upload failed";
        }

        return res.status(400).json({
          success: false,
          message,
        });
      }

      // Custom file-filter error
      if (
        error.message ===
        "Only JPG, JPEG, PNG, and WEBP images are allowed"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // Multipart parser errors
      if (
        error.message &&
        (
          error.message
            .toLowerCase()
            .includes("multipart") ||
          error.message
            .toLowerCase()
            .includes("unexpected end") ||
          error.message
            .toLowerCase()
            .includes("boundary")
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid image upload request. Please select the image again and try again.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to upload image",
      });
    });
  };
};

// =====================================================
// EXPORT
// =====================================================

// Normal upload instance
module.exports = multerUpload;

// Safe wrapper available when needed
module.exports.handleUploadError =
  handleUploadError;