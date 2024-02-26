import { ArgumentsHost, BadRequestException, Logger } from '@nestjs/common';
import { AllExceptionFilter } from './all-exception.filter';
import { ERROR, ErrorObject } from './error.constant';

describe('AllExceptionFilter', () => {
  let filter: AllExceptionFilter;
  const mockJsonFunction = jest.fn();
  const mockStatusFunction = jest.fn().mockImplementation(() => ({ json: mockJsonFunction }));
  const mockGetResponse = jest.fn().mockImplementation(() => ({ status: mockStatusFunction }));
  const mockSwitchToHttp = jest.fn().mockImplementation(() => ({ getResponse: mockGetResponse }));
  const mockArgumentsHost: Partial<ArgumentsHost> = {
    switchToHttp: mockSwitchToHttp,
  };

  beforeEach(() => {
    filter = new AllExceptionFilter();
    jest.restoreAllMocks();
  });

  it('사전 정의되지 않은 ERROR 객체를 전달 받았을 경우', () => {
    // given
    const errorCase = new Error('에러 발생');
    jest.spyOn(Logger, 'error').mockImplementation();

    // when
    filter.catch(errorCase, mockArgumentsHost as ArgumentsHost);

    // then
    // INTERNAL_SERVER_ERROR 객체를 응답으로 반환한다.
    expect(mockJsonFunction).toHaveBeenCalledWith(ERROR.INTERNAL_SERVER_ERROR);
    expect(mockStatusFunction).toHaveBeenCalledWith(500);
  });

  it('사전 정의된 HttpException ERROR 객체를 전달 받았을 경우', () => {
    // given
    const errorInfo: ErrorObject = {
      code: 'INVALID_PARAMETER',
      message: '잘못된 파라미터 입니다q',
      httpStatus: 400,
    };
    const error = new BadRequestException(errorInfo);

    // when
    filter.catch(error, mockArgumentsHost as ArgumentsHost);

    // then
    // 넘겨 받은 에러객체를 응답으로 반환한다.
    expect(mockJsonFunction).toHaveBeenCalledWith(errorInfo);
    expect(mockStatusFunction).toHaveBeenCalledWith(400);
  });
});
