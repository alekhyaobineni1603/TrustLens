import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedSources } from './services/analysisService.js';

const port = process.env.PORT || 5000;
try {
  await connectDB();
  await seedSources();
  app.listen(port, () => console.log(`TrustLens API listening on ${port}`));
} catch (error) {
  console.error('Startup failed:', error.message);
  process.exit(1);
}
