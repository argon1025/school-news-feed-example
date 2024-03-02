import { Test } from '@nestjs/testing';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { NewsFeedEventHandler } from './news-feed.event-handler';
import { CreateSchoolNewsEventPayload, SCHOOL_NEWS_EVENT } from '../school-news/type/school-news-event.type';

describe('NewsFeedEventHandler', () => {
  let newsFeedEventHandler: NewsFeedEventHandler;
  let prismaRepository: PrismaRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [NewsFeedEventHandler],
    }).compile();

    newsFeedEventHandler = moduleRef.get<NewsFeedEventHandler>(NewsFeedEventHandler);
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

  describe('handleSchoolNewsCreate', () => {
    it('학교 소식을 생성할 경우 모든 학교 구독자의 뉴스피드에 소식이 추가된다.', async () => {
      // given
      // 학교 관리자와 학생 생성
      const teacher = await prismaRepository.user.create({
        data: {
          name: '김길동',
          role: 'TEACHER',
        },
      });
      const student = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: 'STUDENT',
        },
      });
      // 테스트 학교 생성 및 구독 추가
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: 'BUSAN',
          schoolMemberList: {
            createMany: {
              data: [
                {
                  userId: teacher.id,
                  nickname: '테스트학교 관리자',
                  role: 'TEACHER',
                },
                {
                  userId: student.id,
                  nickname: '테스트학교 학생',
                  role: 'STUDENT',
                },
              ],
            },
          },
        },
      });
      const teacherSchoolMember = await prismaRepository.schoolMember.findFirst({
        where: {
          userId: teacher.id,
        },
      });
      // 테스트 소식 생성
      const schoolNews = await prismaRepository.schoolNews.create({
        data: {
          schoolId: school.id,
          schoolMemberId: teacherSchoolMember.id,
          title: '테스트 소식',
          content: '테스트 소식 내용',
        },
      });

      // when
      const eventPayload: CreateSchoolNewsEventPayload = {
        eventType: SCHOOL_NEWS_EVENT.SCHOOL_NEWS_CREATE,
        schoolNewsId: schoolNews.id,
      };
      await newsFeedEventHandler.handleSchoolNewsCreate(eventPayload);

      // then
      const newsFeed = await prismaRepository.newsFeed.findMany({
        where: {
          userId: { in: [teacher.id, student.id] },
          contentType: 'SCHOOL_NEWS',
          contentId: schoolNews.id,
        },
      });
      expect(newsFeed).toHaveLength(2);
    });
    it('이벤트 처리 시점에 소식이 삭제된 경우, 뉴스피드에 추가되지 않는다.', async () => {
      // given
      // 학교 관리자와 학생 생성
      const teacher = await prismaRepository.user.create({
        data: {
          name: '김길동',
          role: 'TEACHER',
        },
      });
      const student = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: 'STUDENT',
        },
      });
      // 테스트 학교 생성 및 구독 추가
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: 'BUSAN',
          schoolMemberList: {
            createMany: {
              data: [
                {
                  userId: teacher.id,
                  nickname: '테스트학교 관리자',
                  role: 'TEACHER',
                },
                {
                  userId: student.id,
                  nickname: '테스트학교 학생',
                  role: 'STUDENT',
                },
              ],
            },
          },
        },
      });
      const teacherSchoolMember = await prismaRepository.schoolMember.findFirst({
        where: {
          userId: teacher.id,
        },
      });
      // 테스트 소식 생성
      const schoolNews = await prismaRepository.schoolNews.create({
        data: {
          schoolId: school.id,
          schoolMemberId: teacherSchoolMember.id,
          title: '테스트 소식',
          content: '테스트 소식 내용',
          deletedAt: new Date(),
        },
      });

      // when
      const eventPayload: CreateSchoolNewsEventPayload = {
        eventType: SCHOOL_NEWS_EVENT.SCHOOL_NEWS_CREATE,
        schoolNewsId: schoolNews.id,
      };
      await newsFeedEventHandler.handleSchoolNewsCreate(eventPayload);

      // then
      const newsFeed = await prismaRepository.newsFeed.findMany({
        where: {
          userId: { in: [teacher.id, student.id] },
          contentType: 'SCHOOL_NEWS',
          contentId: schoolNews.id,
        },
      });
      expect(newsFeed).toHaveLength(0);
    });

    it('이벤트 처리 시점에 학교가 삭제된 경우, 뉴스피드에 추가되지 않는다.', async () => {
      // given
      // 학교 관리자와 학생 생성
      const teacher = await prismaRepository.user.create({
        data: {
          name: '김길동',
          role: 'TEACHER',
        },
      });
      const student = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: 'STUDENT',
        },
      });
      // 테스트 학교 생성 및 구독 추가
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: 'BUSAN',
          deletedAt: new Date(),
          schoolMemberList: {
            createMany: {
              data: [
                {
                  userId: teacher.id,
                  nickname: '테스트학교 관리자',
                  role: 'TEACHER',
                },
                {
                  userId: student.id,
                  nickname: '테스트학교 학생',
                  role: 'STUDENT',
                },
              ],
            },
          },
        },
      });
      const teacherSchoolMember = await prismaRepository.schoolMember.findFirst({
        where: {
          userId: teacher.id,
        },
      });
      // 테스트 소식 생성
      const schoolNews = await prismaRepository.schoolNews.create({
        data: {
          schoolId: school.id,
          schoolMemberId: teacherSchoolMember.id,
          title: '테스트 소식',
          content: '테스트 소식 내용',
        },
      });

      // when
      const eventPayload: CreateSchoolNewsEventPayload = {
        eventType: SCHOOL_NEWS_EVENT.SCHOOL_NEWS_CREATE,
        schoolNewsId: schoolNews.id,
      };
      await newsFeedEventHandler.handleSchoolNewsCreate(eventPayload);

      // then
      const newsFeed = await prismaRepository.newsFeed.findMany({
        where: {
          userId: { in: [teacher.id, student.id] },
          contentType: 'SCHOOL_NEWS',
          contentId: schoolNews.id,
        },
      });
      expect(newsFeed).toHaveLength(0);
    });

    it('구독을 취소한 회원인 경우 뉴스피드에 추가되지 않는다', async () => {
      // given
      // 학교 관리자와 학생 생성
      const teacher = await prismaRepository.user.create({
        data: {
          name: '김길동',
          role: 'TEACHER',
        },
      });
      const student = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: 'STUDENT',
        },
      });
      // 테스트 학교 생성 및 구독 추가
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: 'BUSAN',
          schoolMemberList: {
            createMany: {
              data: [
                {
                  userId: teacher.id,
                  nickname: '테스트학교 관리자',
                  role: 'TEACHER',
                },
                {
                  userId: student.id,
                  nickname: '테스트학교 학생',
                  role: 'STUDENT',
                  deletedAt: new Date(),
                },
              ],
            },
          },
        },
      });
      const teacherSchoolMember = await prismaRepository.schoolMember.findFirst({
        where: {
          userId: teacher.id,
        },
      });
      // 테스트 소식 생성
      const schoolNews = await prismaRepository.schoolNews.create({
        data: {
          schoolId: school.id,
          schoolMemberId: teacherSchoolMember.id,
          title: '테스트 소식',
          content: '테스트 소식 내용',
        },
      });

      // when
      const eventPayload: CreateSchoolNewsEventPayload = {
        eventType: SCHOOL_NEWS_EVENT.SCHOOL_NEWS_CREATE,
        schoolNewsId: schoolNews.id,
      };
      await newsFeedEventHandler.handleSchoolNewsCreate(eventPayload);

      // then
      const newsFeed = await prismaRepository.newsFeed.findMany({
        where: {
          userId: { in: [teacher.id, student.id] },
          contentType: 'SCHOOL_NEWS',
          contentId: schoolNews.id,
        },
      });
      expect(newsFeed).toHaveLength(1);
    });
  });
});
