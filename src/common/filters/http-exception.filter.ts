import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiResponseBuilder } from '../utils/api-response.builder';
import { CommonErrors } from '../constants/response.constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getStatus(exception);

    const { messageKey, errors } = this.extractError(exception);

    const requestId = (request.headers['x-request-id'] as string) || 'unknown';

    const path = request.originalUrl;

    this.logError(exception, status, request, messageKey, requestId, path);

    const errorResponse = ApiResponseBuilder.error(
      status,
      messageKey,
      errors ?? undefined,
    );

    response.status(status).json(errorResponse);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return HttpStatus.CONFLICT;
        case 'P2025':
          return HttpStatus.NOT_FOUND;
        default:
          return HttpStatus.BAD_REQUEST;
      }
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private extractError(exception: unknown): {
    messageKey: string;
    errors: Record<string, string[]> | null;
  } {
    let messageKey = CommonErrors.UNKNOWN_ERROR;
    let errors: Record<string, string[]> | null = null;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          messageKey = 'common.error.resource_already_exists';
          break;
        case 'P2025':
          messageKey = 'common.error.resource_not_found';
          break;
        default:
          messageKey = 'common.error.database_error';
      }
      return { messageKey, errors };
    }

    if (!(exception instanceof HttpException)) {
      return { messageKey, errors };
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return { messageKey: response, errors };
    }

    if (typeof response === 'object' && response !== null) {
      const res = response as any;

      if (res.key) {
        return { messageKey: res.key, errors };
      }

      if (Array.isArray(res.message)) {
        messageKey = CommonErrors.VALIDATION_ERROR;
        errors = this.parseValidationErrors(res.message);
      } else if (res.message) {
        messageKey = res.message;
      }
    }

    return { messageKey, errors };
  }

  private parseValidationErrors(messages: string[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    messages.forEach((msg) => {
      const [field, ...rest] = msg.split(' ');
      const errorMessage = rest.join(' ');

      if (!errors[field]) {
        errors[field] = [];
      }

      errors[field].push(errorMessage);
    });

    return errors;
  }

  private logError(
    exception: unknown,
    status: number,
    request: Request,
    message: string,
    requestId: string,
    path: string,
  ) {
    const base = `[${requestId}] ${request.method} ${path}`;
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `💥 ${base} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`⚠️ ${base} -> ${status} | ${message}`);
    }
  }
}
