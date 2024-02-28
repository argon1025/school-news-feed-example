import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { SchoolNewsController } from './school-news.controller';
import { SCHOOL_NEWS_SERVICE } from './type/school-news.service.interface';
import { SchoolNewsService } from './school-news.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [SchoolNewsController],
  providers: [{ provide: SCHOOL_NEWS_SERVICE, useClass: SchoolNewsService }],
  exports: [],
})
export class SchoolNewsModule {}
