import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  domain: { type: String, required: true, lowercase: true, trim: true, unique: true },
  category: { type: String, default: 'NEWS' },
  country: { type: String, default: 'International' },
  trustClassification: { type: String, enum: ['OFFICIAL','ESTABLISHED','FACT_CHECKER','RESEARCH'], default: 'ESTABLISHED' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('TrustedSource', schema);
