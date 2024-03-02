import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { SchoolMemberRoleType } from '../../common/type/common.type';

export class JoinSchoolMemberRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '유저 아이디', example: '91619bb0-8d40-4d6c-882b-92916ebf8c2d' })
  userId: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @ApiProperty({ description: '별명', example: '김철수' })
  nickname: string;

  @IsEnum(SchoolMemberRoleType)
  @ApiProperty({ description: '권한', enum: SchoolMemberRoleType, example: SchoolMemberRoleType.STUDENT })
  role: SchoolMemberRoleType;
}

@Exclude()
export class JoinSchoolMemberResponse {
  @Expose()
  @ApiProperty({ description: '멤버 아이디 (학교 멤버로 소속)', example: '91619bb0-8d40-4d6c-882b-92916ebf8c2d' })
  schoolMemberId: string;
}
