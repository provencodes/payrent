import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { readFileSync } from 'node:fs';
dotenv.config();

export const isDevelopment = process.env.NODE_ENV === 'development';
console.log('datasource: ');

const dataSource = new DataSource({
  type: process.env.DB_TYPE as 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  entities: [process.env.DB_ENTITIES],
  migrations: [process.env.DB_MIGRATIONS],
  synchronize: isDevelopment,
  migrationsTableName: 'migrations',
  ssl: isDevelopment
    ? false
    : {
        ca: readFileSync('/home/oluwaseyi/projects/payRent/ca.pem').toString(),
        rejectUnauthorized: true,
      },
});
export async function initializeDataSource() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

export default dataSource;
