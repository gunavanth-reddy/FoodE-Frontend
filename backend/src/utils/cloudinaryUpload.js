const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

// Upload image buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = "foode") => {
    return new Promise((resolve, reject) => {
        if (!fileBuffer) {
            return reject(new Error("Image buffer is missing"));
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                if (!result) {
                    return reject(
                        new Error("Cloudinary upload failed")
                    );
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        Readable.from(fileBuffer).pipe(uploadStream);
    });
};

// IMPORTANT: Named export
module.exports = { uploadToCloudinary };