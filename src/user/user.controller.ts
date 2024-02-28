import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { USER_SERVICE, UserServiceBase } from './type/user.service.interface';
import { CreateUserRequest } from './dto/create-user.dto';
import { AddErrorObjectToSwagger, ERROR } from '../common/exception/all-exception/error.constant';

@Controller('user')
@ApiTags('회원 - 테스트')
export class UserController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserServiceBase,
  ) {}

  @Post()
  @ApiOperation({ summary: '[테스트] 유저 생성', description: '유저를 생성합니다' })
  @AddErrorObjectToSwagger([ERROR.INTERNAL_SERVER_ERROR])
  async create(@Body() request: CreateUserRequest) {
    const result = await this.userService.create(request);
    return plainToClass(CreateUserRequest, result);
  }
}
