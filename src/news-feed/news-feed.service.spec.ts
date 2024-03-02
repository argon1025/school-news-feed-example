import { Test } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { NewsFeedService } from './news-feed.service';
import { NEWS_FEED_SERVICE } from './type/news-feed.service.interface';
import { NewsFeedContentType, UserRoleType } from '../common/type/common.type';

describe('NewsFeedService', () => {
  let newsFeedService: NewsFeedService;
  let prismaRepository: PrismaRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [{ provide: NEWS_FEED_SERVICE, useClass: NewsFeedService }],
    }).compile();

    newsFeedService = moduleRef.get<NewsFeedService>(NEWS_FEED_SERVICE);
    prismaRepository = moduleRef.get<PrismaRepository>(PrismaRepository);
  });

  beforeEach(async () => {
    await prismaRepository.$transaction([
      prismaRepository.schoolNews.deleteMany(),
      prismaRepository.schoolMember.deleteMany(),
      prismaRepository.school.deleteMany(),
      prismaRepository.newsFeed.deleteMany(),
      prismaRepository.user.deleteMany(),
    ]);
    jest.restoreAllMocks();
  });

  describe('getList', () => {
    it('유저 뉴스 피드를 조회할 경우', async () => {
      // given
      // 테스트 학생 생성
      const student = await prismaRepository.user.create({
        data: {
          name: '김길동',
          role: UserRoleType.STUDENT,
        },
      });
      // 테스트 소식 생성
      await prismaRepository.newsFeed.createMany({
        data: [
          {
            userId: student.id,
            contentType: NewsFeedContentType.SCHOOL_NEWS,
            contentId: '1',
            title: '세번째 피드',
            content: '세번째 피드 내용',
            createdAt: DateTime.fromISO('2021-01-02T11:00:00.000Z').toJSDate(),
          },
          {
            userId: student.id,
            contentType: NewsFeedContentType.SCHOOL_NEWS,
            contentId: '1',
            title: '두번째 피드',
            content: '두번째 피드 내용',
            createdAt: DateTime.fromISO('2021-01-02T10:00:00.000Z').toJSDate(),
            deletedAt: new Date(),
          },
          {
            userId: student.id,
            contentType: NewsFeedContentType.SCHOOL_NEWS,
            contentId: '1',
            title: '첫번째 피드',
            content: '첫번째 피드 내용',
            createdAt: DateTime.fromISO('2021-01-01T10:00:00.000Z').toJSDate(),
          },
        ],
      });

      // when
      const result = await newsFeedService.getList({ userId: student.id, page: 1, size: 10 });

      // then
      expect(result.total).toBe(2);
      expect(result.list[0]).toHaveProperty('title', '세번째 피드');
      expect(result.list[1]).toHaveProperty('title', '첫번째 피드');
    });
  });
});
