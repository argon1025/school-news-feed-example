import { BadRequestException } from '@nestjs/common';
import { ERROR } from '../all-exception/error.constant';
import GenerateValidationException from './validation-exception.factory';

describe('ValidationExceptionFactory', () => {
  it('ValidationPipe 에러를 여러개 받았을 경우', () => {
    // given
    const errorInfo = [
      {
        target: {
          title: '제목 규칙 위반',
          password: '1234',
        },
        value: '제목 규칙 위반',
        property: 'title',
        children: [],
        constraints: {
          isLength: 'title must be shorter than or equal to 3 characters',
          isNumber: 'title must be a number conforming to the specified constraints',
        },
      },
      {
        target: {
          title: '1234',
          password: '1234',
        },
        value: '1234',
        property: 'password',
        children: [],
        constraints: {
          isLength: 'password must be shorter than or equal to 3 characters',
        },
      },
    ];

    // when&then
    // 첫번째 에러 메시지를 반환한다.
    expect(() => GenerateValidationException(errorInfo)).toThrow(
      new BadRequestException({ ...ERROR.INVALID_PARAMETER, message: 'title must be shorter than or equal to 3 characters' }),
    );
  });
  it('ValidationPipe가 빈 배열로 전달되었을 경우', () => {
    // given
    const errorInfo = [];

    // when&then
    // 기본 에러 메시지를 반환한다.
    expect(() => GenerateValidationException(errorInfo)).toThrow(new BadRequestException(ERROR.INVALID_PARAMETER));
  });
});
