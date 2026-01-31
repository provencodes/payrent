import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((res: { message: string; data: unknown }) =>
        this.responseHandler(res, context),
      ),
      catchError((err: unknown) =>
        throwError(() => this.errorHandler(err, context)),
      ),
    );
  }

  errorHandler(exception: unknown, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (exception instanceof HttpException) return exception;
    this.logger.error(
      `Error processing request for ${req.method} ${req.url}, Message: ${exception['message']}, Stack: ${exception['stack']}`,
    );
    return new InternalServerErrorException({
      status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const status_code = res.status_code || response.statusCode;

    response.setHeader('Content-Type', 'application/json');

    // If already in standard format (has success and data fields), return as-is
    if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
      return {
        ...res,
        status_code: res.status_code || status_code,
      };
    }

    // Extract message if exists, otherwise use default
    const message = res?.message || 'Operation completed successfully';

    // If res is not an object, wrap it in data
    if (typeof res !== 'object' || res === null) {
      return {
        success: true,
        message,
        status_code,
        data: res,
      };
    }

    // Remove message from data to avoid duplication
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { message: _, status_code: __, ...dataWithoutMessage } = res;

    if (status_code !== HttpStatus.OK && status_code !== HttpStatus.CREATED) {
      return {
        success: false,
        message,
        status_code,
        data: dataWithoutMessage,
      };
    }

    // Return standard format
    return {
      success: true,
      message,
      status_code,
      data:
        Object.keys(dataWithoutMessage).length > 0 ? dataWithoutMessage : null,
    };
  }
}
