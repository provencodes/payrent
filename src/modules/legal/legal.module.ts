import { Module } from '@nestjs/common';
import { LegalService } from './legal.service';
import { LegalController } from './legal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Legal } from './entities/legal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Legal])],
  controllers: [LegalController],
  providers: [LegalService],
  exports: [LegalService],
})
export class LegalModule {}
