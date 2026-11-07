import { asyncHandler } from '../utils/asyncHandler.js';
import { safeUser } from '../services/authService.js';
import AppError from '../utils/AppError.js';

export const updateMe = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (name.length < 2 || name.length > 80) throw new AppError('Name must be between 2 and 80 characters', 400);
  req.user.name = name;
  await req.user.save();
  res.json({ success: true, data: { user: safeUser(req.user) } });
});
