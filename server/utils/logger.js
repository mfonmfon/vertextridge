/**
 * Production-Grade Logger
 * In production, integrate with services like Winston, Datadog, or Sentry
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

class Logger {
  constructor(context = 'APP') {
    this.context = context;
  }

  _log(level, message, meta = {}) {
    if (LOG_LEVELS[level] > currentLevel) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      context: this.context,
      message,
      ...meta
    };

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Datadog, CloudWatch, or Sentry
      console.log(JSON.stringify(logEntry));
    } else {
      // Development: Pretty print
      const color = {
        error: '\x1b[31m',
        warn: '\x1b[33m',
        info: '\x1b[36m',
        debug: '\x1b[90m'
      }[level];
      console.log(`${color}[${timestamp}] [${level.toUpperCase()}] [${this.context}]\x1b[0m`, message, meta);
    }
  }

  error(message, meta) {
    this._log('error', message, meta);
  }

  warn(message, meta) {
    this._log('warn', message, meta);
  }

  info(message, meta) {
    this._log('info', message, meta);
  }

  debug(message, meta) {
    this._log('debug', message, meta);
  }

  // Audit logging for security events
  audit(action, details) {
    this._log('info', `AUDIT: ${action}`, { audit: true, ...details });
  }
}

module.exports = Logger;
