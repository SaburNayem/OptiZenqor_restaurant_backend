import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const res = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    response.status(status).json({
      success: false,
      message: typeof res === 'string' ? res : (res as any).message || 'Request failed',
      error: res,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
