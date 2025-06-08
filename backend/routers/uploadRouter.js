import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth } from '../utils.js';
import User from '../models/userModel.js';

import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

dotenv.config();

const uploadRouter = express.Router();

const s3 = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files allowed!'), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'lookkg-images', // your bucket
    key(req, file, cb) {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

console.log('🔑 S3 class name:', s3.constructor.name);

// 🖼️ Product image upload
uploadRouter.post(
  '/',
  isAuth,
  upload.single('image'),
  expressAsyncHandler(async (req, res) => {
    try {
      if (!req.file || !req.file.location) {
        console.error('❌ Upload failed: No file or missing location');
        throw new Error('Upload failed: No file or file.location');
      }

      res.send(req.file.location); // S3 public URL
    } catch (err) {
      console.error('🔥 Upload Error:', err.message);
      console.error('🧵 Stack:', err.stack);
      res.status(500).send({ message: err.message });
    }
  })
);

// 👤 Seller logo upload
uploadRouter.post(
  '/logo',
  isAuth,
  upload.single('image'),
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.seller.logo = req.file.location;
    await user.save();
    res.send(req.file.location);
  })
);

export default uploadRouter;