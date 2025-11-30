import mongoose from 'mongoose';
import User from '../models/User.js';

export const getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ status: 'error', message: 'User not found' });
    const user = await User.findById(id).select('displayName avatarUrl').lean();
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

export default { getPublicProfile };
