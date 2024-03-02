import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { CreateSchoolNewsEventPayload, SCHOOL_NEWS_EVENT } from '../school-news/type/school-news-event.type';
import { NewsFeedContentType } from '../common/type/common.type';

@Injectable()
export class NewsFeedEventHandler {
  constructor(private readonly prismaRepository: PrismaRepository) {}

  /**
   * 학교 소식 생성 이벤트 핸들러
   * - 학교 소식을 생성할 경우 학교 구독자의 뉴스피드에 소식이 추가된다.
   */
  @OnEvent(SCHOOL_NEWS_EVENT.SCHOOL_NEWS_CREATE, { async: true })
  async handleSchoolNewsCreate({ schoolNewsId }: CreateSchoolNewsEventPayload) {
    // 학교 소식 조회
    const schoolNews = await this.prismaRepository.schoolNews.findUnique({
      where: { id: schoolNewsId, deletedAt: null, schoolInfo: { deletedAt: null } },
      select: { id: true, schoolId: true, title: true, content: true },
    });
    // 학교페이지가 존재하지 않거나 소식이 삭제된 경우
    if (!schoolNews) {
      return true;
    }

    // 학교 구독자 유저 정보 조회
    const schoolMember = await this.prismaRepository.schoolMember.findMany({
      where: { schoolId: schoolNews.schoolId, deletedAt: null },
      select: { userId: true },
    });
    if (schoolMember.length === 0) {
      return true;
    }

    // 뉴스피드 배치 생성
    try {
      await this.prismaRepository.newsFeed.createMany({
        data: schoolMember.map(({ userId }) => ({
          userId,
          contentType: NewsFeedContentType.SCHOOL_NEWS,
          contentId: schoolNews.id,
          title: schoolNews.title,
          content: schoolNews.content,
        })),
      });
    } catch (error) {
      Logger.error(`피드 생성 실패 schoolNewsId:${schoolNewsId}`, error, 'NewsFeedEventHandler.handleSchoolNewsCreate');
    }
    return true;
  }
}
