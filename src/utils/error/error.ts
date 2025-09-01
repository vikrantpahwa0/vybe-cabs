import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseObj = exception.getResponse();

      if (typeof responseObj === 'string') {
        message = responseObj;
      } else if (typeof responseObj === 'object') {
        const res = responseObj as Record<string, any>;
        message = res.message || message;
        errorCode = res.error || exception.name;
        errors = res.errors || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = exception.name || 'Error';
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      errorCode,
      message,
      errors,
      path: gqlHost.getInfo()?.fieldName || request?.url,
      timestamp: new Date().toISOString(),
    };

    if (response) {
      return response.status(status).json(errorResponse);
    } else {
      return errorResponse;
    }
  }
}
