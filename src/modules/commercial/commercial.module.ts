import { Module, forwardRef } from '@nestjs/common';
import { CommercialService } from './commercial.service';
import { CommercialController } from './commercial.controller';
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
  controllers: [CommercialController],
  providers: [CommercialService],
})
export class CommercialModule { }
