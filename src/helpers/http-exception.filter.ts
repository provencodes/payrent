import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse =
      exception instanceof HttpException ? exception.getResponse() : {};

    let error: any;
    if (typeof errorResponse === 'object' && 'message' in errorResponse) {
      error = errorResponse.message;
    } else if (typeof errorResponse === 'string') {
      error = errorResponse;
    } else {
      error = message;
    }

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
    );

    response.status(status).json({
      success: false,
      message,
      status_code: status,
      error: Array.isArray(error) ? error : [error],
    });
  }
}
