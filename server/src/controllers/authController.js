import { register, login, safeUser } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';

export const registerUser = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const result = await register(input);
  res.status(201).json({ success: true, data: result });
});
export const loginUser = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await login(input);
  res.json({ success: true, data: result });
});
export const me = asyncHandler(async (req, res) => res.json({ success: true, data: { user: safeUser(req.user) } }));
