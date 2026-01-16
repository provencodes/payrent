import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalPackageService } from './legal-package.service';
import { LegalPackageController } from './legal-package.controller';
import { LegalPackage } from './entities/legal-package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LegalPackage])],
  controllers: [LegalPackageController],
  providers: [LegalPackageService],
  exports: [LegalPackageService],
})
export class LegalPackageModule { }
