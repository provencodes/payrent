import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standardized API success response wrapper
 */
export class ApiSuccessResponse<T = any> {
  @ApiProperty({
    example: true,
    description: 'Indicates if the request was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Human-readable message',
  })
  message: string;

  @ApiProperty({ example: 200, description: 'HTTP status code' })
  status_code: number;

  @ApiProperty({ description: 'Response data payload' })
  data: T;
}

/**
 * Paginated response wrapper
 */
export class PaginatedMeta {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 20, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether there is a previous page',
  })
  hasPreviousPage: boolean;
}

export class PaginatedResponse<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Data fetched successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ description: 'Array of items', isArray: true })
  data: T[];

  @ApiProperty({ type: PaginatedMeta, description: 'Pagination metadata' })
  meta: PaginatedMeta;
}

/**
 * File object structure used across the application
 */
export class FileObjectDto {
  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
  })
  url: string;

  @ApiProperty({ example: 'payrent/images/sample_abc123' })
  public_id: string;
}
