import { Pool } from 'pg';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export class MigrationRunner {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async readMigrations(): Promise<string[]> {
    try {
      const migrationDir = join(__dirname, '../../migrations');
      const files = readdirSync(migrationDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      return files;
    } catch (error) {
      throw new Error(`Failed to read migrations directory: ${error}`);
    }
  }

  async runMigrations(): Promise<void> {
    try {
      const files = await this.readMigrations();
      
      for (const file of files) {
        const migrationPath = join(__dirname, '../../migrations', file);
        const sql = readFileSync(migrationPath, 'utf8');
        
        try {
          await this.pool.query(sql);
          console.log(`Migration ${file} executed successfully`);
        } catch (error) {
          console.error(`Error executing migration ${file}: ${error}`);
          throw error;
        }
      }
    } catch (error) {
      throw new Error(`Migration failed: ${error}`);
    }
  }
}