import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

export async function register({ name, email, password }) {
  const normalized = email.toLowerCase();
  if (await User.exists({ email: normalized })) throw new AppError('An account with this email already exists', 409);
  const user = await User.create({ name, email: normalized, passwordHash: await bcrypt.hash(password, 12) });
  return { user: safeUser(user), token: sign(user) };
}
export async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError('Invalid email or password', 401);
  return { user: safeUser(user), token: sign(user) };
}
function sign(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
}
export function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}
