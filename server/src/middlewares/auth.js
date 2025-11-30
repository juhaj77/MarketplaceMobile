import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};

export default auth;
