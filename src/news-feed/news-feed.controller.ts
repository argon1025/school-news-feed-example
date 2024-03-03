import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { NEWS_FEED_SERVICE, NewsFeedServiceBase } from './type/news-feed.service.interface';
import { AddErrorObjectToSwagger, ERROR } from '../common/exception/all-exception/error.constant';
import { GetNewsFeedListRequest, GetNewsFeedListResponse } from './dto/get-news-feed-list.dto';

@Controller()
@ApiTags('회원-뉴스피드')
export class NewsFeedController {
  constructor(
    @Inject(NEWS_FEED_SERVICE)
    private readonly newsFeedService: NewsFeedServiceBase,
  ) {}

  @Get('user/:userId/news-feed')
  @ApiOperation({ summary: '뉴스피드 리스트 조회' })
  @ApiParam({ name: 'userId', description: '사용자 아이디' })
  @AddErrorObjectToSwagger([ERROR.INTERNAL_SERVER_ERROR])
  async getList(@Param('userId') userId: string, @Query() request: GetNewsFeedListRequest) {
    const result = await this.newsFeedService.getList({ ...request, userId });
    return plainToInstance(GetNewsFeedListResponse, result);
  }
}
