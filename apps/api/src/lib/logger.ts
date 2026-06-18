type Level = 'info' | 'warn' | 'error' | 'debug';

function log(level: Level, message: string, meta?: unknown): void {
  if (level === 'debug' && process.env['NODE_ENV'] === 'production') return;
  const line = meta
    ? `[${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}`
    : `[${level.toUpperCase()}] ${message}`;
  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
  debug: (msg: string, meta?: unknown) => log('debug', msg, meta),
};
