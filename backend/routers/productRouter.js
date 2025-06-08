import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import data from '../data.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isSellerOrAdmin } from '../utils.js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const productRouter = express.Router();

productRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const pageSize = 4;
    const page = Number(req.query.pageNumber) || 1;
    const name = req.query.name || '';
    const category = req.query.category || '';
    const seller = req.query.seller || '';
    const order = req.query.order || '';
    const min =
      req.query.min && Number(req.query.min) !== 0 ? Number(req.query.min) : 0;
    const max =
      req.query.max && Number(req.query.max) !== 0 ? Number(req.query.max) : 0;
    const rating =
      req.query.rating && Number(req.query.rating) !== 0
        ? Number(req.query.rating)
        : 0;

    const nameFilter = name ? { name: { $regex: name, $options: 'i' } } : {};
    const sellerFilter = seller ? { seller } : {};
    const categoryFilter = category ? { category } : {};
    const priceFilter = min && max ? { price: { $gte: min, $lte: max } } : {};
    const ratingFilter = rating ? { rating: { $gte: rating } } : {};
    const sortOrder =
      order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : { _id: -1 };
    const count = await Product.countDocuments({
      ...sellerFilter,
      ...nameFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    const products = await Product.find({
      ...sellerFilter,
      ...nameFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .populate('seller', 'seller.name seller.logo')
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    res.send({ products, page, pages: Math.ceil(count / pageSize) });
  })
);

productRouter.get(
  '/seed',
  expressAsyncHandler(async (req, res) => {
    // await Product.remove({});
    const seller = await User.findOne({ isSeller: true });
    if (seller) {
      const products = data.products.map((product) => ({
        ...product,
        seller: seller._id,
      }));
      const createdProducts = await Product.insertMany(products);
      res.send({ createdProducts });
    } else {
      res
        .status(500)
        .send({ message: 'No seller found. first run /api/users/seed' });
    }
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'seller.name seller.logo seller.rating seller.numReviews seller.payMethod'
    );
    if (product) {
      res.send(product);
    } else {
      res.status(404).send({ message: 'Продукт табылган жок' });
    }
  })
);

productRouter.post(
  '/',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = new Product({
      name: 'үлгү аты ' + Date.now(),
      image: '/images/p1.jpg',
      price: 0,
      category: 'үлгү категориясы',
      brand: 'үлгү бренди',
      countInStock: 0,
      rating: 0,
      numReviews: 0,
      description: 'үлгү сүрөттөмөсү',
      seller: req.body.userInfo._id
    });
    const createdProduct = await product.save();
    res.send({ message: 'Продукт түзүлдү', product: createdProduct });
  })
);
productRouter.put(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.price = req.body.price;
      product.image = req.body.image;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      const updatedProduct = await product.save();
      res.send({ message: 'Продукт жаңыртылды', product: updatedProduct });
    } else {
      res.status(404).send({ message: 'Продукт табылган жок' });
    }
  })
);

productRouter.delete(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).send({ message: 'Продукт табылган жок' });
      }

      const user = await User.findById(product.seller);
      if (user) {
        const rating =
          ((user.seller.rating * user.seller.numReviews)
            - product.reviews.reduce((a, c) => c.rating + a, 0)) /
          (user.seller.numReviews - product.numReviews);
        user.seller.rating = Number(rating) || 0;
        user.seller.numReviews = user.seller.numReviews - product.numReviews;
        await user.save();
      }

      // 🧹 Delete image from S3 if it starts with https://
      if (product.image && product.image.startsWith('https://')) {
        try {
          const imageUrl = new URL(product.image);
          const Key = decodeURIComponent(imageUrl.pathname.replace(/^\/+/, ''));
          const deleteParams = { Bucket: 'lookkg-images', Key };
          await s3.send(new DeleteObjectCommand(deleteParams));
          console.log('🧹 Deleted image from S3:', Key);
        } catch (err) {
          console.error('❌ Failed to delete image from S3:', err.message);
        }
      }

      await Product.deleteOne({ _id: product._id });
      res.send({ message: 'Продукт жок болду', product });
    } catch (err) {
      console.error('🔥 DELETE error:', err.stack);
      res.status(500).send({ message: err.message });
    }
  })
);

productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    const user = await User.findById(product.seller);
    if (product) {
      if (product.reviews.find((x) => x.name === req.user.name)) {
        return res
          .status(400)
          .send({ message: 'Сиз сын-пикир калтыргансыз' });
      }
      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      const updatedProduct = await product.save();

      user.seller.rating = 
        ((user.seller.rating * user.seller.numReviews) + review.rating) /
        (user.seller.numReviews + 1);
      user.seller.numReviews = user.seller.numReviews + 1;
      const updatedUser = await user.save();
      
      res.status(201).send({
        message: 'Сын-пикириңиз кошулду',
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        user: updatedUser
      });
    } else {
      res.status(404).send({ message: 'Продукт табылган жок' });
    }
  })
);

export default productRouter;
