import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { ERROR, ErrorObject, isErrorObject } from './error.constant';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 기본 에러 응답을 정의합니다.
    const errorResponse: ErrorObject = ERROR.INTERNAL_SERVER_ERROR;

    // httpException의 경우
    if (exception instanceof HttpException) {
      const errorData = exception.getResponse();

      // error.constant에 정의된 에러인 경우
      if (isErrorObject(errorData)) {
        errorResponse.code = errorData.code;
        errorResponse.message = errorData.message;
        errorResponse.httpStatus = errorData.httpStatus;
      }
    }

    // 사전에 정의되지 않았거나 INTERNAL 에러의 경우 외부에 메시지를 노출하지 않고 로깅만 진행합니다.
    if (errorResponse.httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      Logger.error('사전에 정의되지 않은 에러가 발생했습니다.', exception, 'AllExceptionFilter');
    }

    response.status(errorResponse.httpStatus).json(errorResponse);
  }
}
