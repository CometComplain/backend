import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// this is basic file uploading method. but we need to check the file so we can use file-type module to increase the securty of the application


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const multerFilter = function (req, file, cb) {
    // Accept images and videos only
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error('Not an image or video!'), false);
    }
  };

const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
      folder: 'Products',
      format: async (req, file) => path.extname(file.originalname).substring(1), // supports promises as well
      public_id: (req, file) => req.body.complaintId,
    },
  });
export const upload = multer({ storage: storage, fileFilter: multerFilter });