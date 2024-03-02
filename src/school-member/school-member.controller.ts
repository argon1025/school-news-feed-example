import { Body, Controller, Delete, Inject, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SCHOOL_MEMBER_SERVICE, SchoolMemberServiceBase } from './type/school-member.interface';
import { AddErrorObjectToSwagger, ERROR } from '../common/exception/all-exception/error.constant';
import { JoinSchoolMemberRequest, JoinSchoolMemberResponse } from './dto/join-school-member.dto';

@Controller('school')
@ApiTags('학교-구독')
export class SchoolMemberController {
  constructor(
    @Inject(SCHOOL_MEMBER_SERVICE)
    private readonly schoolMemberService: SchoolMemberServiceBase,
  ) {}

  @Delete('member/:schoolMemberId')
  @ApiOperation({ summary: '학교 구독 취소' })
  @ApiParam({ name: 'schoolMemberId', description: '학교 구독 아이디', example: '91619bb0-8d40-4d6c-882b-92916ebf8c2d' })
  @AddErrorObjectToSwagger([ERROR.INTERNAL_SERVER_ERROR, ERROR.INVALID_PARAMETER, ERROR.SCHOOL_MEMBER_NOT_FOUND])
  async leave(@Param('schoolMemberId') schoolMemberId: string) {
    const result = await this.schoolMemberService.leave({ schoolMemberId });
    return plainToInstance(JoinSchoolMemberResponse, { schoolMemberId: result });
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
