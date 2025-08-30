import { ApiProperty } from '@nestjs/swagger';

export class ReferralUserDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  joinedAt: Date;

  @ApiProperty({ example: { url: 'https://example.com/avatar.jpg', public_id: 'avatar123' } })
  profilePicture?: { url: string; public_id: string };
}

export class ReferralsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Referrals list fetched successfully' })
  message: string;

  @ApiProperty({
    type: 'object',
    properties: {
      referrerCode: { type: 'string', example: 'ABC123XY' },
      totalReferrals: { type: 'number', example: 5 },
      referrals: { type: 'array', items: { $ref: '#/components/schemas/ReferralUserDto' } }
    }
  })
  data: {
    referrerCode: string;
    totalReferrals: number;
    referrals: ReferralUserDto[];
  };
}