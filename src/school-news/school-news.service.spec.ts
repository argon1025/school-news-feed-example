import { Test } from '@nestjs/testing';
import { SchoolUserRole } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { USER_SERVICE, UserRoleType } from '../user/type/user.service.interface';
import { UserService } from '../user/user.service';
import { SchoolNewsService } from './school-news.service';
import { SCHOOL_NEWS_SERVICE } from './type/school-news.service.interface';
import { SchoolRegionType } from '../school/type/school.service.interface';
import { ERROR } from '../common/exception/all-exception/error.constant';

describe('SchoolNewsService', () => {
  let schoolNewsService: SchoolNewsService;
  let prismaRepository: PrismaRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        { provide: USER_SERVICE, useClass: UserService },
        { provide: SCHOOL_NEWS_SERVICE, useClass: SchoolNewsService },
      ],
    }).compile();

    schoolNewsService = moduleRef.get<SchoolNewsService>(SCHOOL_NEWS_SERVICE);
    prismaRepository = moduleRef.get<PrismaRepository>(PrismaRepository);
  });

  beforeEach(async () => {
    await prismaRepository.$transaction([
      prismaRepository.schoolNews.deleteMany(),
      prismaRepository.schoolMember.deleteMany(),
      prismaRepository.school.deleteMany(),
      prismaRepository.user.deleteMany(),
    ]);
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('유효한 학교 관리자가 소식을 생성했을 경우', async () => {
      // given
      // 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
        },
      });
      // 테스트 학교 생성
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: SchoolRegionType.BUSAN,
          schoolMemberList: {
            create: {
              userId: user.id,
              nickname: '학교장홍길동',
              role: SchoolUserRole.TEACHER,
            },
          },
        },
      });

      // when
      const successCase = await schoolNewsService.create({
        userId: user.id,
        schoolId: school.id,
        title: '테스트 소식',
        content: '테스트 소식 내용',
      });

      // then
      const schoolNews = await prismaRepository.schoolNews.findUnique({
        where: { id: successCase.id },
      });
      expect(schoolNews).toHaveProperty('title', '테스트 소식');
      expect(schoolNews).toHaveProperty('content', '테스트 소식 내용');
      expect(schoolNews).toHaveProperty('schoolId', school.id);
    });

    it('학생이 소식을 생성했을 경우', async () => {
      // given
      // 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
        },
      });
      // 테스트 학교 생성
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: SchoolRegionType.BUSAN,
          schoolMemberList: {
            create: {
              userId: user.id,
              nickname: '학교장홍길동',
              role: SchoolUserRole.STUDENT,
            },
          },
        },
      });

      // when
      const failCase = schoolNewsService.create({
        userId: user.id,
        schoolId: school.id,
        title: '테스트 소식',
        content: '테스트 소식 내용',
      });

      // then
      await expect(failCase).rejects.toThrow(new NotFoundException(ERROR.SCHOOL_PERMISSION_CHECK));
    });

    it('학교 멤버가 아닌데 소식을 생성했을 경우', async () => {
      // given
      // 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
        },
      });
      // 테스트 학교 생성, 테스트 유저는 학교 멤버가 아님
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: SchoolRegionType.BUSAN,
        },
      });

      // when
      const failCase = schoolNewsService.create({
        userId: user.id,
        schoolId: school.id,
        title: '테스트 소식',
        content: '테스트 소식 내용',
      });

      // then
      await expect(failCase).rejects.toThrow(new NotFoundException(ERROR.SCHOOL_MEMBER_NOT_FOUND));
    });

    it('학교 구독을 취소한 멤버가 소식을 생성했을 경우', async () => {
      // given
      // 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
        },
      });
      // 테스트 학교 생성 및 구독 취소한 테스트 유저 생성
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: SchoolRegionType.BUSAN,
          schoolMemberList: {
            create: {
              userId: user.id,
              nickname: '학교장홍길동',
              role: SchoolUserRole.TEACHER,
              deletedAt: new Date(),
            },
          },
        },
      });

      // when
      const failCase = schoolNewsService.create({
        userId: user.id,
        schoolId: school.id,
        title: '테스트 소식',
        content: '테스트 소식 내용',
      });

      // then
      expect(failCase).rejects.toThrow(new NotFoundException(ERROR.SCHOOL_MEMBER_NOT_FOUND));
    });

    it('회원 탈퇴한 멤버가 소식을 생성했을 경우', async () => {
      // given
      // 회원탈퇴한 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
          deletedAt: new Date(),
        },
      });
      // 테스트 학교 생성
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: SchoolRegionType.BUSAN,
          schoolMemberList: {
            create: {
              userId: user.id,
              nickname: '학교장홍길동',
              role: SchoolUserRole.TEACHER,
            },
          },
        },
      });

      // when
      const failCase = schoolNewsService.create({
        userId: user.id,
        schoolId: school.id,
        title: '테스트 소식',
        content: '테스트 소식 내용',
      });

      // then
      expect(failCase).rejects.toThrow(new NotFoundException(ERROR.USER_NOT_FOUND));
    });
  });
});