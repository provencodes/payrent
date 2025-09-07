import { Module, forwardRef } from '@nestjs/common';
import { LandlordService } from './landlord.service';
import { LandlordController } from './landlord.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../property/entities/property.entity';
import { UserModule } from '../user/user.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property]),
    UserModule,
    forwardRef(() => SharedModule),
  ],
  controllers: [LandlordController],
  providers: [LandlordService],
})
export class LandlordModule {}
