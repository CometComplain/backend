import cloudinary from 'cloudinary';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import AsyncHandler from 'express-async-handler';
import { Complaint } from '../models/complaintModel.js';

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


    // Get the uploaded file
    const file = req.files.file; // Assuming the file input field name is 'file'

    // Upload the file to Cloudinary
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: 'Compliants',
      public_id: `${file.originalFilename}.${req.body.complaintId}`, // Assuming 'file' has an 'originalFilename' property
      resource_type: 'auto'
    });

    // Add the uploaded file URL to the request object
    req.fileUrl = result.secure_url;
    const {complaintId} = req.body
    const {fileUrl} = req
    // console.log("complaintId",complaintId);
    await Complaint.updateOne({complaintId},{proof:fileUrl},{new:true})
    // Delete the temporary file
    fs.unlink(file.tempFilePath, (err) => {
    if (err) {
      console.error('Error deleting temporary file:', err);
    }
    });
    // Call the next middleware
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