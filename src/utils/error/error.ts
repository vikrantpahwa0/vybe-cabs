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
    const context = gqlHost.getContext();
    const response = context.res;

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
      path: gqlHost.getInfo()?.fieldName,
      timestamp: new Date().toISOString(),
    };
    response.status(status).json(errorResponse);
  }
}
