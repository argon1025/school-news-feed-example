import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { NewsFeedEventHandler } from './news-feed.event-handler';
import { NewsFeedController } from './news-feed.controller';
import { NEWS_FEED_SERVICE } from './type/news-feed.service.interface';
import { NewsFeedService } from './news-feed.service';

@Module({
  imports: [PrismaModule],
  controllers: [NewsFeedController],
  providers: [{ provide: NEWS_FEED_SERVICE, useClass: NewsFeedService }, NewsFeedEventHandler],
})
export class NewsFeedModule {}
