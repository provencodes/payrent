import { Property } from './../entities/property.entity';

export class GetAllPropertyDto {
  message: string;
  data: Property[];
}

export class PropertyResponseDto {
  message: string;
  data: Property;
}
