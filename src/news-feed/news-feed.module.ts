import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { NewsFeedEventHandler } from './news-feed.event-handler';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [NewsFeedEventHandler],
})
export class NewsFeedModule {}
