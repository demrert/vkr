import 'dotenv/config';
import { createApp } from './app';
import { logger } from './lib/logger';

const port = Number(process.env['PORT'] ?? 3000);
const app = createApp();

app.listen(port, () => {
  logger.info(`API running on http://localhost:${port}`);
});
