import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserInterface } from '../interfaces/user.interface';

export class CreateUserSuccessDataDto {
  @ApiProperty({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class CreateUserSuccessResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'User registered successfully' })
  message: string;

  @ApiProperty({ example: 201 })
  status_code: number;

  @ApiProperty({ type: CreateUserSuccessDataDto })
  data: CreateUserSuccessDataDto;
}

export class CreateUserErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Registration failed' })
  message: string;

  @ApiProperty({ example: 400 })
  status_code: number;

  @ApiPropertyOptional({ example: 'Email already exists' })
  error?: string;
}

export class RequestVerificationToken {
  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;
}

type UserResponseDTO = Partial<UserInterface>;

export default UserResponseDTO;
