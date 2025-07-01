import { config } from "./config"

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel

  constructor() {
    this.level = this.getLogLevel()
  }

  private getLogLevel(): LogLevel {
    switch (config.monitoring.logLevel.toLowerCase()) {
      case "error":
        return LogLevel.ERROR
      case "warn":
        return LogLevel.WARN
      case "info":
        return LogLevel.INFO
      case "debug":
        return LogLevel.DEBUG
      default:
        return LogLevel.INFO
    }
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (level <= this.level) {
      const timestamp = new Date().toISOString()
      const levelName = LogLevel[level]

      console.log(`[${timestamp}] ${levelName}: ${message}`, data ? data : "")

      // In production, you might want to send logs to a service like Sentry
      if (config.app.environment === "production" && level === LogLevel.ERROR) {
        // TODO: Send to monitoring service
      }
    }
  }

  error(message: string, data?: any) {
    this.log(LogLevel.ERROR, message, data)
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data)
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data)
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data)
  }
}

export const logger = new Logger()
