import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('SchoolNewsFeed API')
    .setDescription('학교 소식을 전달하고 받아보는 뉴스피드 기능 예제')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, { customSiteTitle: 'SchoolNewsFeed API' });

  // Port 설정
  const servicePort = configService.getOrThrow<number>('SERVICE_PORT');

  await app.listen(servicePort);
  Logger.log(`Server is running on: ${await app.getUrl()}, Swagger: ${await app.getUrl()}/api`, 'Bootstrap');
}
bootstrap();
