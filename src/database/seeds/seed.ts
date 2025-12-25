import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { User, UserType } from '../../modules/user/entities/user.entity';
import { Property } from '../../modules/property/entities/property.entity';
import { Wallet } from '../../modules/wallet/entities/wallet.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting database seeding...');

  try {
    // Seed Users
    const userRepository = dataSource.getRepository(User);
    const users = [
      {
        email: 'admin@payrent.com',
        name: 'Admin User',
        password: await bcrypt.hash('password123', 10),
        userType: UserType.ADMIN,
        isAdmin: true,
        isEmailVerified: true,
        isActive: true,
        phoneNumber: '+2348012345678',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
      },
      {
        email: 'landlord@payrent.com',
        name: 'John Landlord',
        password: await bcrypt.hash('password123', 10),
        userType: UserType.LANDLORD,
        isEmailVerified: true,
        isActive: true,
        phoneNumber: '+2348012345679',
        city: 'Abuja',
        state: 'FCT',
        country: 'Nigeria',
      },
      {
        email: 'tenant@payrent.com',
        name: 'Jane Tenant',
        password: await bcrypt.hash('password123', 10),
        userType: UserType.TENANT,
        isEmailVerified: true,
        isActive: true,
        phoneNumber: '+2348012345680',
        city: 'Port Harcourt',
        state: 'Rivers',
        country: 'Nigeria',
      },
    ];

    for (const userData of users) {
      const existingUser = await userRepository.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        const user = userRepository.create(userData);
        await userRepository.save(user);
        console.log(`✅ Created user: ${userData.email}`);
      }
    }

    // Seed Wallets
    const walletRepository = dataSource.getRepository(Wallet);
    const allUsers = await userRepository.find();
    
    for (const user of allUsers) {
      const existingWallet = await walletRepository.findOne({ where: { userId: user.id } });
      if (!existingWallet) {
        const wallet = walletRepository.create({
          userId: user.id,
          balanceKobo: user.userType === 'landlord' ? '500000000' : '10000000',
          isActive: true,
        });
        await walletRepository.save(wallet);
        console.log(`✅ Created wallet for: ${user.email}`);
      }
    }

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

seed();