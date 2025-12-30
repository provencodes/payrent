import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base error response structure
 */
export class BaseErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'An error occurred' })
  message: string;

  @ApiProperty({ example: 400 })
  status_code: number;

  @ApiPropertyOptional({ example: 'Detailed error description' })
  error?: string;
}

/**
 * 400 Bad Request
 */
export class BadRequestErrorDto extends BaseErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ example: 400 })
  status_code: number;

  @ApiPropertyOptional({
    example: [
      'email must be an email',
      'password must be at least 8 characters',
    ],
    description: 'Array of validation error messages',
    isArray: true,
  })
  errors?: string[];
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedErrorDto extends BaseErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Unauthorized' })
  message: string;

  @ApiProperty({ example: 401 })
  status_code: number;

  @ApiPropertyOptional({ example: 'Invalid or expired token' })
  error?: string;
}

/**
 * 403 Forbidden
 */
export class ForbiddenErrorDto extends BaseErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Forbidden' })
  message: string;

  @ApiProperty({ example: 403 })
  status_code: number;

  @ApiPropertyOptional({
    example: 'You do not have permission to access this resource',
  })
  error?: string;
}

/**
 * 404 Not Found
 */
export class NotFoundErrorDto extends BaseErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Resource not found' })
  message: string;

  @ApiProperty({ example: 404 })
  status_code: number;

  @ApiPropertyOptional({ example: 'User with ID xyz not found' })
  error?: string;
}

/**
 * 500 Internal Server Error
 */
export class InternalServerErrorDto extends BaseErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Internal server error' })
  message: string;

  @ApiProperty({ example: 500 })
  status_code: number;

  @ApiPropertyOptional({ example: 'An unexpected error occurred' })
  error?: string;
}
