import { DataSource } from 'typeorm';
import { seedUsers } from './user.seed';
import { seedProperties } from './property.seed';
import { seedWallets } from './wallet.seed';
import dataSource from '../datasource';

export const runSeeds = async () => {
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    console.log('🌱 Starting database seeding...');

    await seedUsers(dataSource);
    await seedWallets(dataSource);
    await seedProperties(dataSource);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

if (require.main === module) {
  runSeeds().catch(console.error);
}