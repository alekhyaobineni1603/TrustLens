import Analysis from '../models/Analysis.js';
import { analysisSchema } from '../validators/schemas.js';
import { createAnalysis } from '../services/analysisService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const create = asyncHandler(async (req, res) => {
  const input = analysisSchema.parse(req.body);
  const result = await createAnalysis(req.user._id, input);
  res.status(201).json({ success: true, data: { analysis: result } });
});
export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const filter = { userId: req.user._id };
  if (req.query.assessment) filter.overallAssessment = req.query.assessment;
  if (req.query.q) filter.$or = [{ extractedTitle: { $regex: escapeRegex(req.query.q), $options: 'i' } }, { extractedContent: { $regex: escapeRegex(req.query.q), $options: 'i' } }];
  const [items, total] = await Promise.all([
    Analysis.find(filter).select('-extractedContent -originalText').sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit),
    Analysis.countDocuments(filter)
  ]);
  res.json({ success: true, data: { items, page, limit, total, pages: Math.ceil(total/limit) } });
});
export const getOne = asyncHandler(async (req, res) => {
  const item = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
  if (!item) throw new AppError('Analysis not found', 404);
  res.json({ success: true, data: { analysis: item } });
});
export const remove = asyncHandler(async (req, res) => {
  const item = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!item) throw new AppError('Analysis not found', 404);
  res.json({ success: true, message: 'Analysis deleted' });
});
export const status = asyncHandler(async (req, res) => {
  const item = await Analysis.findOne({ _id: req.params.id, userId: req.user._id }).select('status failureMessage completedAt');
  if (!item) throw new AppError('Analysis not found', 404);
  res.json({ success: true, data: item });
});
function escapeRegex(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100); }
