const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'uni_connect_documents',
            resource_type: 'auto', // Important for PDFs/Docs
            // valid formats: must correspond to the file type or omit to keep original
            // format: 'auto' is not always supported in multer-storage params directly like this, better to omit or calculate
        };
    },
});

module.exports = { cloudinary, storage };
