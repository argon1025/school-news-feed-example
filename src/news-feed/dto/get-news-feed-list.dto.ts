import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';
import { NewsFeedContentType } from '../../common/type/common.type';

export class GetNewsFeedListRequest {
  @IsNumber()
  @Min(1)
  @ApiProperty({ description: '페이지 번호', example: 1 })
  @Type(() => Number)
  page: number;

  @IsNumber()
  @Min(1)
  @ApiProperty({ description: '페이지 크기', example: 10 })
  @Type(() => Number)
  size: number;
}

@Exclude()
export class GetNewsFeedListItem {
  @Expose()
  @ApiProperty({ description: '뉴스 피드 아이디', example: '91619bb0-8d40-4d6c-882b-92916ebf8c2d' })
  id: string;

  @Expose()
  @ApiProperty({ description: '콘텐츠 타입', example: NewsFeedContentType.SCHOOL_NEWS })
  contentType: NewsFeedContentType;

  @Expose()
  @ApiProperty({ description: '콘텐츠 아이디', example: '91619bb0-8d40-4d6c-882b-92916ebf8c2d' })
  contentId: string;

  @Expose()
  @ApiProperty({ description: '콘텐츠 제목', example: '제목' })
  title: string;

  @Expose()
  @ApiProperty({ description: '콘텐츠 내용', example: '내용' })
  content: string;

  @Expose()
  @ApiProperty({ description: '생성일 (ISO8601 UTC)', example: '2021-07-01T00:00:00' })
  createdAt: string;
}

@Exclude()
export class GetNewsFeedListResponse {
  @Expose()
  @ApiProperty({ description: '토탈', example: 10 })
  total: number;

  @Expose()
  @Type(() => GetNewsFeedListItem)
  list: GetNewsFeedListItem[];
}
