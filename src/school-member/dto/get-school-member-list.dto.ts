import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsString, Min } from 'class-validator';
import { SchoolRegionType } from '../../common/type/common.type';
import { SchoolNewsRoleType } from '../../school-news/type/school-news.service.interface';

export class GetSchoolMemberListRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '유저 아이디', example: '91619bb0-8d40-4d6c-882b-92916ebf8c2d' })
  userId: string;

  @Min(1)
  @ApiProperty({ description: '리스트 사이즈', example: 10 })
  @Type(() => Number)
  size: number;

  @Min(1)
  @ApiProperty({ description: '페이지', example: 1 })
  @Type(() => Number)
  page: number;
}

@Exclude()
export class GetSchoolMemberListItem {
  @Expose()
  @ApiProperty({ description: '학교 멤버 아이디', example: '91619bb0-8d40-4d6c-882b-92916ebf8c2d' })
  schoolMemberId: string;

  @Expose()
  @ApiProperty({ description: '학교 아이디', example: '91619bb0-8d40-4d6c-882b-92916ebf8c2d' })
  schoolId: string;

  @Expose()
  @ApiProperty({ description: '학교 이름', example: '학교이름' })
  schoolName: string;

  @Expose()
  @ApiProperty({ description: '학교 지역', example: SchoolRegionType.DAEGU })
  region: SchoolRegionType;

  @Expose()
  @ApiProperty({ description: '나의 별명', example: '별명' })
  nickname: string;

  @Expose()
  @ApiProperty({ description: '나의 권한', example: SchoolNewsRoleType.STUDENT })
  role: SchoolNewsRoleType;

  @Expose()
  @ApiProperty({ description: '가입일 (ISO8601 UTC)', example: '2021-07-01T00:00:00' })
  createdAt: string;
}

@Exclude()
export class GetSchoolMemberListResponse {
  @Expose()
  @ApiProperty({ description: '토탈', example: 10 })
  total: number;

  @Expose()
  @Type(() => GetSchoolMemberListItem)
  @ApiProperty({ description: '학교 멤버 리스트' })
  list: GetSchoolMemberListItem[];
}
