import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';
import { SchoolNewsRoleType } from '../type/school-news.service.interface';

export class GetSchoolNewsListRequest {
  @ApiProperty({ description: '페이지 사이즈', example: 10 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  size: number;

  @ApiProperty({ description: '페이지', example: 1, type: Number })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page = 1;
}

@Exclude()
export class GetSchoolNewsListWriterInfo {
  @Expose()
  @ApiProperty({ description: '작성자 학교 멤버 ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: '작성자 학교 닉네임' })
  nickname: string;

  @Expose()
  @ApiProperty({ description: '작성자 회원 ID' })
  userId: string;

  @Expose()
  @ApiProperty({ description: '작성자 학교 권한' })
  role: SchoolNewsRoleType;
}

@Exclude()
export class GetSchoolNewsListItem {
  @Expose()
  @ApiProperty({ description: '소식 ID', example: '7f2023de-6c27-4e01-bb14-30c975315f6a' })
  id: string;

  @Expose()
  @ApiProperty({ description: '제목', example: '학교 소식 제목' })
  title: string;

  @Expose()
  @ApiProperty({ description: '내용', example: '학교 소식 내용' })
  content: string;

  @Expose()
  @Type(() => GetSchoolNewsListWriterInfo)
  @ApiProperty({ description: '작성자 정보' })
  writerInfo: GetSchoolNewsListWriterInfo;

  // @Expose()
  @ApiProperty({ description: '작성일 (ISO8601 UTC)', example: '2021-07-01T00:00:00' })
  createdAt: string;

  @Expose()
  @ApiProperty({ description: '수정일 (ISO8601 UTC)', example: '2021-07-01T00:00:00' })
  updatedAt: string;
}

@Exclude()
export class GetSchoolNewsListResponse {
  @Expose()
  @ApiProperty({ description: '총 개수' })
  total: number;

  @Expose()
  @Type(() => GetSchoolNewsListItem)
  @ApiProperty({ description: '소식 리스트' })
  list: GetSchoolNewsListItem[];
}
