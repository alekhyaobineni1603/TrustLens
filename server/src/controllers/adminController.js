import User from '../models/User.js';
import Analysis from '../models/Analysis.js';
import TrustedSource from '../models/TrustedSource.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const dashboard = asyncHandler(async (req,res) => {
  const [users, analyses, sources] = await Promise.all([User.countDocuments(), Analysis.countDocuments(), TrustedSource.countDocuments({ isActive: true })]);
  res.json({ success: true, data: { users, analyses, activeSources: sources } });
});
export const listUsers = asyncHandler(async (req,res) => {
  const users = await User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: users });
});
export const listSources = asyncHandler(async (req,res) => res.json({ success: true, data: await TrustedSource.find().sort({ name: 1 }) }));
export const createSource = asyncHandler(async (req,res) => {
  const name = String(req.body.name || '').trim();
  const domain = String(req.body.domain || '').toLowerCase().trim();
  if (!name || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) throw new AppError('Valid source name and domain are required', 400);
  const source = await TrustedSource.create({ name, domain, category: req.body.category || 'NEWS', country: req.body.country || 'International', trustClassification: req.body.trustClassification || 'ESTABLISHED' });
  res.status(201).json({ success: true, data: source });
});
export const updateSource = asyncHandler(async (req,res) => {
  const source = await TrustedSource.findByIdAndUpdate(req.params.id, { $set: { isActive: Boolean(req.body.isActive) } }, { new: true, runValidators: true });
  if (!source) throw new AppError('Source not found', 404);
  res.json({ success: true, data: source });
});
export const deleteSource = asyncHandler(async (req,res) => {
  const source = await TrustedSource.findByIdAndDelete(req.params.id);
  if (!source) throw new AppError('Source not found', 404);
  res.json({ success: true, message: 'Source deleted' });
});
