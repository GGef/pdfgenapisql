export enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
  WARN = 'WARN'
}

interface LogMetadata {
  userId?: string;
  requestId: string;
  operation: string;
  resourcePath: string;
  method?: string;
  statusCode?: number;
  duration?: number;
}

class Logger {
  private logToConsole(level: LogLevel, message: string, metadata: LogMetadata, error?: Error) {
    const timestamp = new Date().toISOString();
    const logData = {
      level,
      timestamp,
      message,
      ...metadata,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    };

    switch (level) {
      case LogLevel.ERROR:
        console.error(logData);
        break;
      case LogLevel.WARN:
        console.warn(logData);
        break;
      case LogLevel.DEBUG:
        console.debug(logData);
        break;
      default:
        console.log(logData);
    }
  }

  async info(message: string, metadata: LogMetadata) {
    this.logToConsole(LogLevel.INFO, message, metadata);
  }

  async error(message: string, metadata: LogMetadata, error: Error) {
    this.logToConsole(LogLevel.ERROR, message, metadata, error);
  }

  async debug(message: string, metadata: LogMetadata) {
    if (process.env.NODE_ENV !== 'production') {
      this.logToConsole(LogLevel.DEBUG, message, metadata);
    }
  }

  async warn(message: string, metadata: LogMetadata) {
    this.logToConsole(LogLevel.WARN, message, metadata);
  }
}

export const logger = new Logger();