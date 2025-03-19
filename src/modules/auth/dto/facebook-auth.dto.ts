import { ApiProperty } from '@nestjs/swagger';

export class FacebookAuthPayloadDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    description: 'The URL of the user\'s avatar',
    example: 'https://example.com/avatar.jpg',
  })
  picture: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  full_name: string;
}
