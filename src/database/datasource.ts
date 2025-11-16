import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
// import { readFileSync } from 'node:fs';
dotenv.config();

// const caCert = Buffer.from(process.env.DB_CERT_BASE64, 'base64').toString(
//   'utf-8',
// );

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isLocalDb = process.env.NODE_DB === 'local';

const dataSource = new DataSource({
  type: 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  entities: isDevelopment ? ['src/modules/**/entities/*.entity.ts'] : [process.env.DB_ENTITIES],
  migrations: isDevelopment ? ['src/migrations/*.ts'] : [process.env.DB_MIGRATIONS],
  synchronize: isDevelopment,
  migrationsTableName: 'migrations',
  ssl: isLocalDb
    ? false
    : {
        rejectUnauthorized: false,
      },
});
export async function initializeDataSource() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

export default dataSource;
