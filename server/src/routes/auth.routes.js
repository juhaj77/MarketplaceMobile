import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/auth.controller.js';
import validate from '../utils/validate.js';

const router = Router();

router.post(
  '/register',
  [
    body('displayName').isString().trim().notEmpty().withMessage('displayName required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isString().isLength({ min: 8 }).withMessage('Password min length 8'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isString().notEmpty().withMessage('Password required'),
  ],
  validate,
  login
);

export default router;
