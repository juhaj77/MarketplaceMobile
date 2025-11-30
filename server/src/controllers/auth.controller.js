import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { signAccessToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const { displayName, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Email already in use' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ displayName, email, passwordHash });

    const token = signAccessToken({ id: user._id.toString(), email: user.email });

    return res.status(201).json({
      user: { id: user._id.toString(), displayName: user.displayName, email: user.email, avatarUrl: user.avatarUrl },
      token,
    });
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = signAccessToken({ id: user._id.toString(), email: user.email });

    return res.json({
      user: { id: user._id.toString(), displayName: user.displayName, email: user.email, avatarUrl: user.avatarUrl },
      token,
    });
  } catch (err) {
    return next(err);
  }
};

export default { register, login };
