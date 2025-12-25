import { DataSource } from 'typeorm';
import { User, UserType } from '../../modules/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

export const seedUsers = async (dataSource: DataSource) => {
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
    {
      email: 'manager@payrent.com',
      name: 'Mike Manager',
      password: await bcrypt.hash('password123', 10),
      userType: UserType.MANAGER,
      isEmailVerified: true,
      isActive: true,
      phoneNumber: '+2348012345681',
      city: 'Kano',
      state: 'Kano',
      country: 'Nigeria',
    },
  ];

  for (const userData of users) {
    const existingUser = await userRepository.findOne({ where: { email: userData.email } });
    if (!existingUser) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`Created user: ${userData.email}`);
    }
  }
};