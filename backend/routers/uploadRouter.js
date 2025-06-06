import multer from 'multer';
import expressAsyncHandler from 'express-async-handler';
import express from 'express';
import Product from '../models/productModel.js';
import { isAuth } from '../utils.js';
import fs from "fs";
import User from '../models/userModel.js';

const uploadRouter = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, `uploads/`);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}.jpg`);
  },
});
const upload = multer({ storage });

uploadRouter.post('/:id', isAuth, upload.single('image'), expressAsyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    var img = fs.readFileSync(`./${req.file.path}`);
    var encode_image = img.toString('base64');
    product.notImage.data = new Buffer.from(encode_image, 'base64')
    product.save();
    res.send(`/${req.file.path}`);
    fs.unlinkSync(`./${req.file.path}`);
  } catch(e) {
    console.log(e)
  }
}));

uploadRouter.post('/', isAuth, upload.single('image'), expressAsyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    var logo = fs.readFileSync(`./${req.file.path}`);
    var encode_logo = logo.toString('base64');
    user.seller.notLogo.data = new Buffer.from(encode_logo, 'base64')
    user.save();
    res.send(`/${req.file.path}`);
    fs.unlinkSync(`./${req.file.path}`);
  } catch(e) {
    console.log(e)
  }
}));

export default uploadRouter;
