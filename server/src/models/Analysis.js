import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  sourceName: String,
  sourceUrl: { type: String, required: true },
  sourceDomain: String,
  sourceCategory: String,
  sourcePublishedAt: Date,
  retrievedAt: { type: Date, default: Date.now },
  relevantExcerpt: String,
  evidenceRelationship: { type: String, enum: ['SUPPORTS', 'CONTRADICTS', 'NEUTRAL'], default: 'NEUTRAL' },
  relevanceScore: Number
}, { _id: true });

const claimSchema = new mongoose.Schema({
  claimText: { type: String, required: true },
  claimType: { type: String, default: 'VERIFIABLE' },
  assessment: { type: String, enum: ['SUPPORTED','LIKELY_SUPPORTED','MIXED_EVIDENCE','LIKELY_FALSE','FALSE','INSUFFICIENT_EVIDENCE'], default: 'INSUFFICIENT_EVIDENCE' },
  explanation: String,
  confidence: { type: Number, min: 0, max: 100 },
  position: Number,
  evidence: [evidenceSchema]
}, { _id: true });

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  submissionType: { type: String, enum: ['TEXT', 'URL', 'CLAIM'], required: true },
  originalText: { type: String, default: '' },
  originalUrl: String,
  extractedTitle: String,
  extractedContent: String,
  language: { type: String, default: 'unknown' },
  status: { type: String, enum: ['PENDING','PROCESSING','COMPLETED','FAILED'], default: 'PENDING', index: true },
  overallAssessment: { type: String, enum: ['SUPPORTED','LIKELY_SUPPORTED','MIXED_EVIDENCE','LIKELY_FALSE','FALSE','INSUFFICIENT_EVIDENCE'], default: 'INSUFFICIENT_EVIDENCE' },
  confidence: { type: Number, min: 0, max: 100 },
  summary: String,
  limitations: [String],
  claims: [claimSchema],
  failureMessage: String,
  completedAt: Date
}, { timestamps: true });

analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ userId: 1, overallAssessment: 1, createdAt: -1 });

export default mongoose.model('Analysis', analysisSchema);
