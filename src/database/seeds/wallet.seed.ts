import { DataSource } from 'typeorm';
import { Wallet } from '../../modules/wallet/entities/wallet.entity';
import { User } from '../../modules/user/entities/user.entity';

export const seedWallets = async (dataSource: DataSource) => {
  const walletRepository = dataSource.getRepository(Wallet);
  const userRepository = dataSource.getRepository(User);

  const users = await userRepository.find();

  for (const user of users) {
    const existingWallet = await walletRepository.findOne({ where: { userId: user.id } });
    if (!existingWallet) {
      const wallet = walletRepository.create({
        userId: user.id,
        balanceKobo: user.userType === 'landlord' ? '500000000' : '10000000', // ₦5M for landlord, ₦100K for others
        isActive: true,
      });
      await walletRepository.save(wallet);
      console.log(`Created wallet for user: ${user.email}`);
    }
  }
};