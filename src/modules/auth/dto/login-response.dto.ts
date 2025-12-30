import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LoginUserDataDto {
  @ApiProperty({ example: 'd3f7a939-4fc0-4a1e-9a0b-92b748c63e2a' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({
    example: 'tenant',
    enum: ['landlord', 'tenant', 'manager', 'admin'],
  })
  userType: string;

  @ApiPropertyOptional({
    example: {
      url: 'https://res.cloudinary.com/demo/image/upload/profile.jpg',
      public_id: 'profile_123',
    },
  })
  profilePicture?: { url: string; public_id: string };
}

class LoginDataDto {
  @ApiProperty({ type: LoginUserDataDto })
  user: LoginUserDataDto;
}

export class LoginResponseDto {
  @ApiPropertyOptional({ example: true })
  success?: boolean;

  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiPropertyOptional({ example: 200 })
  status_code?: number;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  access_token: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE1MTYyMzkwMjJ9.drt_po6bHE5R5K6lFQ3Vl7DxGBPz0P1r2TtY-J8Wr4M',
  })
  refresh_token: string;

  @ApiProperty({ type: LoginDataDto })
  data: LoginDataDto;
}
