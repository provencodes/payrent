import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(response: string | Record<string, unknown>, status: HttpStatus) {
    super(response, status);
  }

  getResponse() {
    const response = super.getResponse();
    const status = this.getStatus();

    if (response !== null) {
      const res = response as Record<string, unknown>;
      return {
        message: 'An error occured',
        error: res,
        status_code: status,
      };
    }

    return {
      message: response,
      error: this.name,
      status_code: status,
    };
  }
}
