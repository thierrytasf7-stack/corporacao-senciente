import { Sequelize } from 'sequelize';
import { env } from '../config/env-validator';
import { logger } from '../utils/logger';

export const sequelize = new Sequelize(env.databaseUrl, {
  logging: env.nodeEnv === 'production' ? false : (msg: string) => logger.debug(msg),
  dialectOptions: {
    ssl: env.nodeEnv === 'production',
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialect: 'postgres',
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true,
  },
});

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    
    // Sync models (in production, use migrations instead)
    if (env.nodeEnv !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('🔄 Database models synchronized');
    }
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await sequelize.close();
    logger.info('✅ Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
  }
}