export class Logger {
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  info(message: string, ...meta: any[]): void {
    this.log('INFO', message, meta);
  }

  warn(message: string, ...meta: any[]): void {
    this.log('WARN', message, meta);
  }

  error(message: string, ...meta: any[]): void {
    this.log('ERROR', message, meta);
  }

  private log(level: string, message: string, meta: any[]): void {
    const timestamp = new Date().toISOString();
    const metaString = meta.length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    
    console.log(`[${timestamp}] [${level}] [${this.name}] ${message}${metaString}`);
  }
}