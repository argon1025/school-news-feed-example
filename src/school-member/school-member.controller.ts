import { Body, Controller, Delete, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SCHOOL_MEMBER_SERVICE, SchoolMemberServiceBase } from './type/school-member.interface';
import { AddErrorObjectToSwagger, ERROR } from '../common/exception/all-exception/error.constant';
import { JoinSchoolMemberRequest, JoinSchoolMemberResponse } from './dto/join-school-member.dto';
import { GetSchoolMemberListRequest, GetSchoolMemberListResponse } from './dto/get-school-member-list.dto';
import { DeleteSchoolMemberRequest } from './dto/delete-school-member.dto';

@Controller('school')
@ApiTags('학교-구독')
export class SchoolMemberController {
  constructor(
    @Inject(SCHOOL_MEMBER_SERVICE)
    private readonly schoolMemberService: SchoolMemberServiceBase,
  ) {}

  @Get('/member')
  @ApiOperation({ summary: '학교 구독 리스트' })
  @AddErrorObjectToSwagger([ERROR.INTERNAL_SERVER_ERROR, ERROR.INVALID_PARAMETER])
  async getList(@Query() request: GetSchoolMemberListRequest) {
    const result = await this.schoolMemberService.getList(request);
    return plainToInstance(GetSchoolMemberListResponse, result);
  }

  @Delete(':schoolId/member')
  @ApiOperation({ summary: '학교 구독 취소' })
  @ApiParam({ name: 'schoolId', description: '학교 아이디', example: '91619bb0-8d40-4d6c-882b-92916ebf8c2d' })
  @AddErrorObjectToSwagger([ERROR.INTERNAL_SERVER_ERROR, ERROR.INVALID_PARAMETER, ERROR.SCHOOL_MEMBER_NOT_FOUND])
  async leave(@Param('schoolId') schoolId: string, @Body() request: DeleteSchoolMemberRequest) {
    const result = await this.schoolMemberService.leave({ ...request, schoolId });
    return plainToInstance(JoinSchoolMemberResponse, { schoolMemberId: result.schoolId });
  }

  @Post(':schoolId/member')
  @ApiOperation({ summary: '학교 구독' })
  @ApiParam({ name: 'schoolId', description: '학교 아이디', example: '91619bb0-8d40-4d6c-882b-92916ebf8c2d' })
  @AddErrorObjectToSwagger([ERROR.INTERNAL_SERVER_ERROR, ERROR.INVALID_PARAMETER, ERROR.SCHOOL_NOT_FOUND, ERROR.ALREADY_JOINED])
  async join(@Param('schoolId') schoolId: string, @Body() request: JoinSchoolMemberRequest) {
    const { schoolMemberId } = await this.schoolMemberService.join({ ...request, schoolId });
    return plainToInstance(JoinSchoolMemberResponse, { schoolMemberId });
  }
}
