import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SCHOOL_NEWS_SERVICE, SchoolNewsServiceBase } from './type/school-news.service.interface';
import { AddErrorObjectToSwagger, ERROR } from '../common/exception/all-exception/error.constant';
import { CreateSchoolNewsRequest, CreateSchoolNewsResponse } from './dto/create-school-news.dto';
import { PatchSchoolNewsRequest, PatchSchoolNewsResponse } from './dto/patch-school-news.dto';
import { DeleteSchoolNewsRequest, DeleteSchoolNewsResponse } from './dto/delete-school-news.dto';
import { GetSchoolNewsListRequest, GetSchoolNewsListResponse } from './dto/get-school-news-list.dto';

@Controller('school')
@ApiTags('학교-소식')
export class SchoolNewsController {
  constructor(
    @Inject(SCHOOL_NEWS_SERVICE)
    private readonly schoolNewsService: SchoolNewsServiceBase,
  ) {}

  @Delete('news/:schoolNewsId')
  @ApiOperation({
    summary: '학교 소식 삭제',
    description: '학교 소식을 삭제합니다. <br>해당 학교 멤버 중 선생님 Role을 가진 사용자만 사용할 수 있습니다.',
  })
  @ApiParam({ name: 'schoolNewsId', description: '학교 소식 ID', example: '7f2023de-6c27-4e01-bb14-30c975315f6a' })
  @AddErrorObjectToSwagger([
    ERROR.INTERNAL_SERVER_ERROR,
    ERROR.SCHOOL_NEWS_NOT_FOUND,
    ERROR.SCHOOL_MEMBER_NOT_FOUND,
    ERROR.SCHOOL_PERMISSION_CHECK,
    ERROR.USER_NOT_FOUND,
  ])
  async delete(@Param('schoolNewsId') schoolNewsId: string, @Body() request: DeleteSchoolNewsRequest) {
    const result = await this.schoolNewsService.delete({ ...request, id: schoolNewsId });
    return plainToInstance(DeleteSchoolNewsResponse, { schoolNewsId: result.id });
  }

  @Patch('news/:schoolNewsId')
  @ApiOperation({
    summary: '학교 소식 수정',
    description: '학교 소식을 수정합니다. <br>해당 학교 멤버 중 선생님 Role을 가진 사용자만 사용할 수 있습니다.',
  })
  @ApiParam({ name: 'schoolNewsId', description: '학교 소식 ID', example: '7f2023de-6c27-4e01-bb14-30c975315f6a' })
  @AddErrorObjectToSwagger([
    ERROR.INTERNAL_SERVER_ERROR,
    ERROR.SCHOOL_NEWS_NOT_FOUND,
    ERROR.SCHOOL_MEMBER_NOT_FOUND,
    ERROR.SCHOOL_PERMISSION_CHECK,
    ERROR.USER_NOT_FOUND,
  ])
  async update(@Body() request: PatchSchoolNewsRequest, @Param('schoolNewsId') schoolNewsId: string) {
    const result = await this.schoolNewsService.update({ ...request, id: schoolNewsId });
    return plainToInstance(PatchSchoolNewsResponse, { schoolNewsId: result.id });
  }

  @Post(':schoolId/news')
  @ApiOperation({
    summary: '학교 소식 생성',
    description: '학교 소식을 생성합니다. <br>해당 학교 멤버 중 선생님 Role을 가진 사용자만 사용할 수 있습니다.',
  })
  @ApiParam({ name: 'schoolId', description: '학교 ID', example: '7f2023de-6c27-4e01-bb14-30c975315f6a' })
  @AddErrorObjectToSwagger([
    ERROR.INTERNAL_SERVER_ERROR,
    ERROR.SCHOOL_NOT_FOUND,
    ERROR.SCHOOL_MEMBER_NOT_FOUND,
    ERROR.SCHOOL_PERMISSION_CHECK,
    ERROR.USER_NOT_FOUND,
  ])
  async create(@Body() request: CreateSchoolNewsRequest, @Param('schoolId') schoolId: string) {
    const result = await this.schoolNewsService.create({ ...request, schoolId });
    return plainToInstance(CreateSchoolNewsResponse, { schoolNewsId: result.id });
  }

  @Get(':schoolId/news')
  @ApiOperation({
    summary: '학교 소식 리스트 조회',
    description: '해당 학교의 소식 리스트를 조회합니다.',
  })
  @ApiParam({ name: 'schoolId', description: '학교 ID', example: '7f2023de-6c27-4e01-bb14-30c975315f6a' })
  @AddErrorObjectToSwagger([ERROR.INTERNAL_SERVER_ERROR])
  async getList(@Param('schoolId') schoolId: string, @Query() request: GetSchoolNewsListRequest) {
    return plainToInstance(GetSchoolNewsListResponse, await this.schoolNewsService.getList({ ...request, schoolId }));
  }
}
