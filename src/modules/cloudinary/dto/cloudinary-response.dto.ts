import { ApiProperty } from '@nestjs/swagger';

// ==================== Upload Response ====================

export class UploadedFileDto {
  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
  })
  url: string;

  @ApiProperty({ example: 'payrent/images/sample_abc123' })
  public_id: string;
}

export class UploadImagesResponseDto {
  @ApiProperty({ example: 201 })
  Status: number;

  @ApiProperty({ example: 'Images uploaded successfully' })
  Message: string;

  @ApiProperty({ type: [UploadedFileDto], isArray: true })
  Data: UploadedFileDto[];
}

// ==================== Delete Response ====================

export class DeleteImageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Image deleted successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;
}
