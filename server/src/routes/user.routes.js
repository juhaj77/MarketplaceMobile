import { Router } from 'express';
import { param } from 'express-validator';
import validate from '../utils/validate.js';
import { getPublicProfile } from '../controllers/user.controller.js';

const router = Router();

router.get(
  '/:id',
  [param('id').isString().trim()],
  validate,
  getPublicProfile
);

export default router;
