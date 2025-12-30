import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { PaystackGateway } from '../payment/gateways/paystack.gateway';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: Repository<Wallet>;
  let transactionRepository: Repository<WalletTransaction>;
  let paystackGateway: PaystackGateway;

  const mockWalletRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockTransactionRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPaystackGateway = {
    initiatePayment: jest.fn(),
    verifyPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(WalletTransaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: PaystackGateway,
          useValue: mockPaystackGateway,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get<Repository<Wallet>>(
      getRepositoryToken(Wallet),
    );
    transactionRepository = module.get<Repository<WalletTransaction>>(
      getRepositoryToken(WalletTransaction),
    );
    paystackGateway = module.get<PaystackGateway>(PaystackGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateWallet', () => {
    it('should return existing wallet if found', async () => {
      const userId = 'test-user-id';
      const existingWallet = { id: 'wallet-id', userId, balanceKobo: '0' };

      mockWalletRepository.findOne.mockResolvedValue(existingWallet);

      const result = await service.getOrCreateWallet(userId);

      expect(result).toEqual(existingWallet);
      expect(mockWalletRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should create new wallet if not found', async () => {
      const userId = 'test-user-id';
      const newWallet = { id: 'new-wallet-id', userId, balanceKobo: '0' };

      mockWalletRepository.findOne.mockResolvedValue(null);
      mockWalletRepository.create.mockReturnValue(newWallet);
      mockWalletRepository.save.mockResolvedValue(newWallet);

      const result = await service.getOrCreateWallet(userId);

      expect(result).toEqual(newWallet);
      expect(mockWalletRepository.create).toHaveBeenCalledWith({
        userId,
        balanceKobo: '0',
      });
      expect(mockWalletRepository.save).toHaveBeenCalledWith(newWallet);
    });
  });

  describe('payWithWallet', () => {
    it('should throw error if wallet not found', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(
        service.payWithWallet({
          userId: 'test-user',
          amountNaira: 100,
          reason: 'test',
          description: 'test payment',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if insufficient balance', async () => {
      const wallet = {
        id: 'wallet-id',
        userId: 'test-user',
        balanceKobo: '5000',
      }; // 50 naira
      mockWalletRepository.findOne.mockResolvedValue(wallet);

      await expect(
        service.payWithWallet({
          userId: 'test-user',
          amountNaira: 100, // 100 naira
          reason: 'test',
          description: 'test payment',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
