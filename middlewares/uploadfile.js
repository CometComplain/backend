import cloudinary from 'cloudinary';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import AsyncHandler from 'express-async-handler';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Add this line to use HTTPS
});

// Update the Cloudinary configuration with the provided URL
cloudinary.config({
  url: process.env.CLOUDINARY_URL,
});

// File upload middleware
const uploadFileToCloudinary = AsyncHandler(async (req, res, next) => {
  try {
    // Check if a file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    // Get the uploaded file
    const file = req.files.file; // Assuming the file input field name is 'file'

    // Filter the file based on your requirements (e.g., mime type, size)
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      return res.status(400).send('Invalid file type.');
    }

    try {
      // Upload the file to Cloudinary
      const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: 'Compliants',
        public_id: req.body.complaintId, // Assuming you have a 'complaintId' field in your request body
        resource_type: 'auto'
      });

     // Delete the temporary file
      fs.unlink(file.tempFilePath, (err) => {
        if (err) {
          console.error('Error deleting temporary file:', err);
        }
      }); // Add closing parenthesis here

      // Add the uploaded file URL to the request object
      req.fileUrl = result.secure_url;

      // Call the next middleware
      return;
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      res.status(500).send('Error uploading file.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading file.');
  }
});

// Initialize express-fileupload middleware
const fileUploadMiddleware = (req, res, next) => {
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
  })(req, res, next);
};

export { fileUploadMiddleware, uploadFileToCloudinary };