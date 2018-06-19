import * as winston from 'winston'

export function createLogger(label: string): winston.Logger {
  const alignedWithColorsAndTime = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.label({ label: label }),
    winston.format.printf((info) => {
      const {
        timestamp, level, label, message, ...args
      } = info

      const ts = timestamp.slice(0, 19).replace('T', ' ')
      return `${ts} [${label}] ${level}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`
    })
  )

  return winston.createLogger({
    level: 'info',
    format: alignedWithColorsAndTime,
    transports: [
      new winston.transports.Console()
    ]
  })
}
