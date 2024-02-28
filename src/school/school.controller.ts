import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SCHOOL_SERVICE, SchoolServiceBase } from './type/school.service.interface';
import { AddErrorObjectToSwagger, ERROR } from '../common/exception/all-exception/error.constant';
import { CreateSchoolRequest, CreateSchoolResponse } from './dto/create-school.dto';

@Controller('school')
@ApiTags('학교')
export class SchoolController {
  constructor(
    @Inject(SCHOOL_SERVICE)
    private readonly schoolService: SchoolServiceBase,
  ) {}

  @Post()
  @ApiOperation({ summary: '학교 페이지 생성' })
  @AddErrorObjectToSwagger([ERROR.USER_NOT_FOUND, ERROR.SCHOOL_CREATE_TEACHER_ONLY, ERROR.INTERNAL_SERVER_ERROR])
  async create(@Body() request: CreateSchoolRequest) {
    const result = await this.schoolService.create(request);
    return plainToInstance(CreateSchoolResponse, { schoolId: result.id });
  }
}
