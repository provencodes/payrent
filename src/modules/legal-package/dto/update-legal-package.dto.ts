import { PartialType } from '@nestjs/swagger';
import { CreateLegalPackageDto } from './create-legal-package.dto';

export class UpdateLegalPackageDto extends PartialType(CreateLegalPackageDto) { }
