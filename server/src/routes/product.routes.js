import { Router } from 'express';
import multer from 'multer';
import { body, param, query } from 'express-validator';
import auth from '../middlewares/auth.js';
import validate from '../utils/validate.js';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';

const router = Router();

// Multer config: memory storage, 5MB limit, image mime types only
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Invalid file type. Only jpg/png/webp allowed'));
  },
});

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().trim(),
    query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('sort').optional().isString().trim(),
  ],
  validate,
  listProducts
);

router.get(
  '/:id',
  [param('id').isString().trim()],
  validate,
  getProduct
);

router.post(
  '/',
  auth,
  upload.single('image'),
  [
    body('title').isString().trim().notEmpty(),
    body('description').isString().trim().notEmpty(),
    body('price').isFloat({ min: 0 }).toFloat(),
  ],
  validate,
  createProduct
);

router.put(
  '/:id',
  auth,
  upload.single('image'),
  [
    param('id').isString().trim(),
    body('title').optional().isString().trim().notEmpty(),
    body('description').optional().isString().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }).toFloat(),
  ],
  validate,
  updateProduct
);

router.delete(
  '/:id',
  auth,
  [param('id').isString().trim()],
  validate,
  deleteProduct
);

export default router;
