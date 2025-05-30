import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiGoneResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { FAILED_TO_SEND_EMAIL } from '../../../helpers/systemMessages';

export function ApiVerificationEmailResponsesDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Email verification successful',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Account verification successful',
          },
          status_code: { type: 'number', example: HttpStatus.OK },
        },
      },
    }),
    ApiGoneResponse({
      description: 'Verification token expired',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Token expired' },
          status_code: { type: 'number', example: HttpStatus.GONE },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid verification token',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid token' },
          status_code: { type: 'number', example: HttpStatus.BAD_REQUEST },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'user not found' },
          status_code: { type: 'number', example: HttpStatus.NOT_FOUND },
        },
      },
    }),
  );
}

export function ApiResendVerificationEmailResponsesDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Verification email sent',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Check your mail, verification email sent!',
          },
          status_code: { type: 'number', example: HttpStatus.OK },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'user not found' },
          status_code: { type: 'number', example: HttpStatus.NOT_FOUND },
        },
      },
    }),
    ApiConflictResponse({
      description: 'Email already verified',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Email already verified' },
          status_code: { type: 'number', example: HttpStatus.CONFLICT },
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: FAILED_TO_SEND_EMAIL,
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: FAILED_TO_SEND_EMAIL },
          status_code: {
            type: 'number',
            example: HttpStatus.INTERNAL_SERVER_ERROR,
          },
        },
      },
    }),
  );
}

export function changePasswordWithOtp() {
  return applyDecorators(
    ApiOperation({ summary: 'final password change' }),
    ApiResponse({
      status: 200,
      description: 'Password reset successful',
    }),
    ApiBody({
      description: 'The email and new password for resetting the password',
      examples: {
        example1: {
          summary: 'Valid Request',
          value: {
            email: 'user@example.com',
            newPassword: 'StrongP@ssw0rd!',
          },
        },
      },
    }),
    ApiBadRequestResponse({ description: 'invalid otp' }),
  );
}
