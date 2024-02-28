import { HttpStatus, applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

export interface ErrorObject {
  code: string;
  message: string;
  httpStatus: HttpStatus;
}

export const ERROR: { [key: string]: ErrorObject } = {
  /**
   * 공통 에러
   */
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 내부 에러',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  INVALID_PARAMETER: {
    code: 'INVALID_PARAMETER',
    message: '잘못된 파라미터 입니다',
    httpStatus: HttpStatus.BAD_REQUEST,
  },

  /**
   * 유저 에러
   */
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: '유저를 찾을 수 없습니다',
    httpStatus: HttpStatus.NOT_FOUND,
  },

  /**
   * 학교 에러
   */
  SCHOOL_CREATE_TEACHER_ONLY: {
    code: 'SCHOOL_CREATE_TEACHER_ONLY',
    message: '선생님만 학교를 생성할 수 있습니다',
    httpStatus: HttpStatus.FORBIDDEN,
  },
};

export const isErrorObject = (obj: any): obj is ErrorObject => {
  return obj && obj.code && obj.message && obj.httpStatus;
};

// 스웨거 Exception Description을 위한 데코레이터
export const AddErrorObjectToSwagger = (errorList: ErrorObject[]) => {
  const unauthorized = errorList
    .filter((error) => error.httpStatus === HttpStatus.UNAUTHORIZED)
    .map((error) => `${error.code}: ${error.message}`)
    .join('</br>');
  const badRequest = errorList
    .filter((error) => error.httpStatus === HttpStatus.BAD_REQUEST)
    .map((error) => `${error.code}: ${error.message}`)
    .join('</br>');
  const notFound = errorList
    .filter((error) => error.httpStatus === HttpStatus.NOT_FOUND)
    .map((error) => `${error.code}: ${error.message}`)
    .join('</br>');
  const forbidden = errorList
    .filter((error) => error.httpStatus === HttpStatus.FORBIDDEN)
    .map((error) => `${error.code}: ${error.message}`)
    .join('</br>');
  const internalServerError = errorList
    .filter((error) => error.httpStatus === HttpStatus.INTERNAL_SERVER_ERROR)
    .map((error) => `${error.code}: ${error.message}`)
    .join('</br>');

  return applyDecorators(
    ApiBadRequestResponse({ description: badRequest }),
    ApiForbiddenResponse({ description: forbidden }),
    ApiNotFoundResponse({ description: notFound }),
    ApiUnauthorizedResponse({ description: unauthorized }),
    ApiInternalServerErrorResponse({ description: internalServerError }),
  );
};
