import mongoose from 'mongoose';
import sharp from 'sharp';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { uploadBuffer, deleteResource } from '../utils/cloudinary.js';

function buildQuery({ search, minPrice, maxPrice, isActive = true }) {
  const q = { };
  if (isActive !== undefined) q.isActive = isActive;
  if (minPrice !== undefined || maxPrice !== undefined) {
    q.price = {};
    if (minPrice !== undefined) q.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) q.price.$lte = Number(maxPrice);
  }
  if (search) {
    q.$text = { $search: search };
  }
  return q;
}

export const listProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;
    const { search, minPrice, maxPrice, sort } = req.query;

    const query = buildQuery({ search, minPrice, maxPrice });

    let sortObj = { createdAt: -1 };
    if (sort) {
      // Example: createdAt:desc or price:asc
      const [field, dir] = sort.split(':');
      if (field) {
        sortObj = { [field]: dir === 'asc' ? 1 : -1 };
      }
    }

    const [data, total] = await Promise.all([
      Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('owner', 'displayName avatarUrl')
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.json({ data, page, totalPages, total });
  } catch (err) {
    return next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ status: 'error', message: 'Product not found' });
    const product = await Product.findById(id).populate('owner', 'displayName avatarUrl').lean();
    if (!product) return res.status(404).json({ status: 'error', message: 'Product not found' });
    return res.json({ product });
  } catch (err) {
    return next(err);
  }
};

async function processAndUploadImage(fileBuffer, mimetype) {
  if (!fileBuffer) return null;
  const pipeline = sharp(fileBuffer).rotate().resize({ width: 1200, withoutEnlargement: true });
  // Convert to jpeg for consistency, quality 80
  const outBuffer = await pipeline.jpeg({ quality: 80 }).toBuffer();
  const result = await uploadBuffer(outBuffer, { folder: 'marketplace', resource_type: 'image' });
  return { url: result.secure_url, publicId: result.public_id };
}

export const createProduct = async (req, res, next) => {
  try {
    const { title, description, price } = req.body;
    const owner = req.user.id;

    let imageUrl;
    let imagePublicId;

    if (req.file) {
      const uploaded = await processAndUploadImage(req.file.buffer, req.file.mimetype);
      imageUrl = uploaded?.url;
      imagePublicId = uploaded?.publicId;
    }

    const product = await Product.create({ title, description, price, owner, imageUrl, imagePublicId });
    const populated = await product.populate('owner', 'displayName avatarUrl');

    return res.status(201).json({ product: populated });
  } catch (err) {
    return next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ status: 'error', message: 'Product not found' });
    if (product.owner.toString() !== req.user.id) return res.status(403).json({ status: 'error', message: 'Forbidden' });

    const updates = {};
    ['title', 'description'].forEach((f) => {
      if (typeof req.body[f] === 'string' && req.body[f].length > 0) updates[f] = req.body[f];
    });
    if (req.body.price !== undefined) updates.price = req.body.price;

    if (req.file) {
      const uploaded = await processAndUploadImage(req.file.buffer, req.file.mimetype);
      if (uploaded) {
        // delete old image
        if (product.imagePublicId) {
          try { await deleteResource(product.imagePublicId); } catch (e) { /* noop */ }
        }
        updates.imageUrl = uploaded.url;
        updates.imagePublicId = uploaded.publicId;
      }
    }

    Object.assign(product, updates);
    await product.save();
    const populated = await product.populate('owner', 'displayName avatarUrl');

    return res.json({ product: populated });
  } catch (err) {
    return next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ status: 'error', message: 'Product not found' });
    if (product.owner.toString() !== req.user.id) return res.status(403).json({ status: 'error', message: 'Forbidden' });

    if (product.imagePublicId) {
      try { await deleteResource(product.imagePublicId); } catch (e) { /* noop */ }
    }

    await product.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

export default { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
