import jwt from 'jsonwebtoken';

export function signAccessToken(payload, expiresIn = '60m') {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

export default { signAccessToken };
