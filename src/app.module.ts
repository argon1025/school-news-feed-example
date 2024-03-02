import { ClassSerializerInterceptor, MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpLoggerMiddleware } from './common/middleware/http-logger/http-logger.middleware';
import { AllExceptionFilter } from './common/exception/all-exception/all-exception.filter';
import GenerateValidationException from './common/exception/validation-exception/validation-exception.factory';
import { UserModule } from './user/user.module';
import { SchoolModule } from './school/school.module';
import { SchoolNewsModule } from './school-news/school-news.module';
import { SchoolMemberModule } from './school-member/school-member.module';
import { NewsFeedModule } from './news-feed/news-feed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `environments/.env.${process.env.NODE_ENV || 'local'}`,
    }),
    UserModule,
    NewsFeedModule,
    SchoolModule,
    SchoolNewsModule,
    SchoolMemberModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        forbidUnknownValues: true,
        exceptionFactory: GenerateValidationException,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
