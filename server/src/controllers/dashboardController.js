import Analysis from '../models/Analysis.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const overview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [total, groups, recent] = await Promise.all([
    Analysis.countDocuments({ userId, status: 'COMPLETED' }),
    Analysis.aggregate([{ $match: { userId, status: 'COMPLETED' } }, { $group: { _id: '$overallAssessment', count: { $sum: 1 } } }]),
    Analysis.find({ userId }).select('-extractedContent -originalText').sort({ createdAt: -1 }).limit(5)
  ]);
  const counts = Object.fromEntries(groups.map(g => [g._id, g.count]));
  res.json({ success: true, data: { total, supported: (counts.SUPPORTED || 0)+(counts.LIKELY_SUPPORTED || 0), misleading: (counts.LIKELY_FALSE || 0)+(counts.FALSE || 0), mixed: counts.MIXED_EVIDENCE || 0, inconclusive: counts.INSUFFICIENT_EVIDENCE || 0, recent } });
});
export const activity = asyncHandler(async (req, res) => {
  const rows = await Analysis.aggregate([
    { $match: { userId: req.user._id, createdAt: { $gte: new Date(Date.now()-29*86400000) } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  res.json({ success: true, data: rows.map(r => ({ date: r._id, count: r.count })) });
});
