import { DataSource } from 'typeorm';
import { Property } from '../../modules/property/entities/property.entity';
import { User } from '../../modules/user/entities/user.entity';

export const seedProperties = async (dataSource: DataSource) => {
  const propertyRepository = dataSource.getRepository(Property);
  const userRepository = dataSource.getRepository(User);

  const landlord = await userRepository.findOne({ where: { email: 'landlord@payrent.com' } });
  if (!landlord) return;

  const properties = [
    {
      title: 'Luxury 3 Bedroom Apartment',
      type: '3 bedroom apartment',
      listingType: 'rent',
      category: 'apartment',
      address: 'Victoria Island, Lagos',
      description: 'Modern 3-bedroom apartment with ocean view',
      bedrooms: 3,
      bathrooms: 2,
      toilets: 3,
      propertySize: '120 sqm',
      floorLevels: 1,
      parkingAvailable: true,
      amenities: ['wifi', 'gym', 'pool', 'security'],
      rentalPrice: 2400000,
      serviceCharge: 200000,
      securityDepositRequired: true,
      advanceRentPayment: 2400000,
      numberOfMonths: 12,
      agreeToTerms: true,
      images: [],
      owner: landlord.id,
      status: 'approved',
      approved: true,
      listedBy: landlord.id,
    },
    {
      title: 'Investment Property - Shares Available',
      type: '4 bedroom duplex',
      listingType: 'shares',
      category: 'home',
      address: 'Lekki Phase 1, Lagos',
      description: 'Premium duplex available for fractional ownership',
      bedrooms: 4,
      bathrooms: 3,
      toilets: 4,
      propertySize: '200 sqm',
      floorLevels: 2,
      parkingAvailable: true,
      amenities: ['wifi', 'gym', 'garden', 'security'],
      price: 50000000,
      pricePerShare: 1000000,
      numberOfUnit: 50,
      minimumInvestment: 1000000,
      fullInvestmentPrice: 50000000,
      investmentDuration: 24,
      investmentGoal: 50000000,
      amountRaised: 15000000,
      estimatedRentalIncomePerMonth: 400000,
      interestRate: 15,
      returnDuration: '24 months',
      percentageReturns: '15%',
      agreeToTerms: true,
      images: [],
      owner: landlord.id,
      status: 'approved',
      approved: true,
      listedBy: landlord.id,
    },
    {
      title: 'Property for Sale',
      type: '2 bedroom flat',
      listingType: 'sale',
      category: 'apartment',
      address: 'Ikeja GRA, Lagos',
      description: 'Well-maintained 2-bedroom flat for outright purchase',
      bedrooms: 2,
      bathrooms: 2,
      toilets: 2,
      propertySize: '85 sqm',
      floorLevels: 1,
      parkingAvailable: true,
      amenities: ['wifi', 'security', 'generator'],
      price: 25000000,
      negotiable: true,
      agreeToTerms: true,
      images: [],
      owner: landlord.id,
      status: 'approved',
      approved: true,
      listedBy: landlord.id,
    },
    {
      title: 'Joint Venture Opportunity',
      type: 'Commercial building',
      listingType: 'joint-venture',
      category: 'office',
      address: 'Central Business District, Abuja',
      description: 'Commercial building development opportunity',
      propertySize: '500 sqm',
      floorLevels: 5,
      parkingAvailable: true,
      amenities: ['elevator', 'security', 'backup power'],
      minimumInvestment: 10000000,
      fullInvestmentPrice: 100000000,
      investmentDuration: 36,
      investmentGoal: 100000000,
      amountRaised: 30000000,
      interestRate: 20,
      returnDuration: '36 months',
      percentageReturns: '20%',
      agreeToTerms: true,
      images: [],
      owner: landlord.id,
      status: 'approved',
      approved: true,
      listedBy: landlord.id,
    },
  ];

  for (const propertyData of properties) {
    const existingProperty = await propertyRepository.findOne({ 
      where: { title: propertyData.title } 
    });
    if (!existingProperty) {
      const property = propertyRepository.create(propertyData);
      await propertyRepository.save(property);
      console.log(`Created property: ${propertyData.title}`);
    }
  }
};