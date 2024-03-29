import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SchoolUserRole } from '@prisma/client';
import { DateTime } from 'luxon';
import { SchoolMemberService } from './school-member.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { USER_SERVICE } from '../user/type/user.service.interface';
import { UserService } from '../user/user.service';
import { SCHOOL_MEMBER_SERVICE } from './type/school-member.interface';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { SchoolMemberRoleType, SchoolRegionType, UserRoleType } from '../common/type/common.type';
import { ERROR } from '../common/exception/all-exception/error.constant';

describe('SchoolMemberService', () => {
  let schoolMemberService: SchoolMemberService;
  let prismaRepository: PrismaRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        { provide: USER_SERVICE, useClass: UserService },
        { provide: SCHOOL_MEMBER_SERVICE, useClass: SchoolMemberService },
      ],
    }).compile();

    schoolMemberService = moduleRef.get<SchoolMemberService>(SCHOOL_MEMBER_SERVICE);
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

  describe('join', () => {
    it('학교에 구독하는 경우', async () => {
      // given
      // 테스트 학생 생성
      const student = await prismaRepository.user.create({
        data: {
          name: '김길동',
          role: UserRoleType.STUDENT,
        },
      });
      // 테스트 학교 생성
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: SchoolRegionType.BUSAN,
        },
      });

      // when
      // 학생이 학교에 구독
      const teacherJoinResult = await schoolMemberService.join({
        userId: student.id,
        nickname: '학생김길동',
        role: SchoolMemberRoleType.STUDENT,
        schoolId: school.id,
      });

      // then
      const schoolMember = await prismaRepository.schoolMember.findUnique({
        where: { id: teacherJoinResult.schoolMemberId },
      });
      expect(schoolMember).toHaveProperty('userId', student.id);
      expect(schoolMember).toHaveProperty('nickname', '학생김길동');
      expect(schoolMember).toHaveProperty('role', SchoolMemberRoleType.STUDENT);
    });

    it('학교가 삭제또는 존재하지 않는 경우', async () => {
      // given
      // 테스트 학생 생성
      const student = await prismaRepository.user.create({
        data: {
          name: '김길동',
          role: UserRoleType.STUDENT,
        },
      });
      // 삭제된 학교 생성
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: SchoolRegionType.BUSAN,
          deletedAt: new Date(),
        },
      });

      // when
      // 학생이 삭제된 학교에 구독
      const errorCase1 = schoolMemberService.join({
        userId: student.id,
        nickname: '학생김길동',
        role: SchoolMemberRoleType.STUDENT,
        schoolId: school.id,
      });
      // 학생이 존재하지 않는 학교에 구독
      const errorCase2 = schoolMemberService.join({
        userId: student.id,
        nickname: '학생김길동',
        role: SchoolMemberRoleType.STUDENT,
        schoolId: '존재하지않는학교',
      });

      // then
      await expect(errorCase1).rejects.toThrow(new NotFoundException(ERROR.SCHOOL_NOT_FOUND));
      await expect(errorCase2).rejects.toThrow(new NotFoundException(ERROR.SCHOOL_NOT_FOUND));
    });
    it('이미 구독한 경우', async () => {
      // given
      // 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
        },
      });
      // 테스트 학교 생성 및 가입
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
      // 이미 가입된 학교에 구독
      const errorCase = schoolMemberService.join({
        userId: user.id,
        nickname: '학교장홍길동',
        role: SchoolMemberRoleType.TEACHER,
        schoolId: school.id,
      });

      // then
      await expect(errorCase).rejects.toThrow(new BadRequestException(ERROR.ALREADY_JOINED));
    });
    it('구독을 취소했다 다시 구독하는 경우', async () => {
      // given
      // 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
        },
      });
      // 테스트 학교 생성 및 가입
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
      // 구독을 취소한 후 다시 구독
      const result = await schoolMemberService.join({
        userId: user.id,
        nickname: '학교장홍길동',
        role: SchoolMemberRoleType.TEACHER,
        schoolId: school.id,
      });

      // then
      const schoolMember = await prismaRepository.schoolMember.findUnique({
        where: { id: result.schoolMemberId },
      });
      expect(schoolMember).toHaveProperty('userId', user.id);
      expect(schoolMember).toHaveProperty('nickname', '학교장홍길동');
      expect(schoolMember).toHaveProperty('role', SchoolMemberRoleType.TEACHER);
    });
  });

  describe('leave', () => {
    it('학교 구독을 취소하는 경우', async () => {
      // given
      // 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
        },
      });
      // 테스트 학교 생성 및 가입
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
      // 학교 구독 취소
      await schoolMemberService.leave({ schoolId: school.id, userId: user.id });

      // then
      const exitSchoolMember = await prismaRepository.schoolMember.findFirst({ where: { userId: user.id } });
      expect(exitSchoolMember.deletedAt).not.toBeNull();
    });

    it('이미 삭제된 학교이거나 존재하지 않은 상태인 경우', async () => {
      // given
      // 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
        },
      });

      // when
      // 존재하지 않는 학교 구독 취소
      const errorCase = schoolMemberService.leave({ userId: user.id, schoolId: '존재하지않는학교' });

      // then
      await expect(errorCase).rejects.toThrow(new NotFoundException(ERROR.MEMBER_NOT_FOUND));
    });
    it('이미 구독을 취소했거나 구독하지 않은 상태인 경우', async () => {
      // given
      // 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
        },
      });
      // 테스트 학교 생성 및 가입
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
      const errorCase1 = schoolMemberService.leave({ schoolId: school.id, userId: user.id });

      // then
      await expect(errorCase1).rejects.toThrow(new NotFoundException(ERROR.MEMBER_NOT_FOUND));
    });
  });

  describe('getList', () => {
    it('학교 구독 리스트를 조회하는 경우', async () => {
      // given
      // 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
        },
      });
      // 테스트 학교 생성 및 가입
      await prismaRepository.school.create({
        data: {
          name: '두번째 학교',
          region: SchoolRegionType.BUSAN,
          schoolMemberList: {
            create: {
              userId: user.id,
              nickname: '학교장홍길동',
              role: SchoolUserRole.TEACHER,
              createdAt: DateTime.fromISO('2021-07-02T10:00:00').toJSDate(),
            },
          },
        },
      });
      await prismaRepository.school.create({
        data: {
          name: '첫번째 학교',
          region: SchoolRegionType.BUSAN,
          schoolMemberList: {
            create: {
              userId: user.id,
              nickname: '학교장홍길동',
              role: SchoolUserRole.TEACHER,
              createdAt: DateTime.fromISO('2021-07-02T15:00:00').toJSDate(),
            },
          },
        },
      });

      // when
      // 학교 구독 리스트 조회
      const result = await schoolMemberService.getList({ userId: user.id, page: 1, size: 10 });

      // then
      expect(result).toHaveProperty('total', 2);
      expect(result.list[0]).toHaveProperty('schoolName', '첫번째 학교');
      expect(result.list[1]).toHaveProperty('schoolName', '두번째 학교');
    });
    it('삭제된 학교가 있는 경우', async () => {
      // given
      // 테스트 유저 생성
      const user = await prismaRepository.user.create({
        data: {
          name: '홍길동',
          role: UserRoleType.TEACHER,
        },
      });
      // 테스트 학교 생성 및 가입
      await prismaRepository.school.create({
        data: {
          name: '네번째 학교',
          region: SchoolRegionType.BUSAN,
          schoolMemberList: {
            create: {
              userId: user.id,
              nickname: '학교장홍길동',
              role: SchoolUserRole.TEACHER,
              createdAt: DateTime.fromISO('2021-07-02T08:00:00').toJSDate(),
            },
          },
        },
      });
      await prismaRepository.school.create({
        data: {
          name: '세번째 삭제된 학교',
          region: SchoolRegionType.BUSAN,
          deletedAt: new Date(),
          schoolMemberList: {
            create: {
              userId: user.id,
              nickname: '학교장홍길동',
              role: SchoolUserRole.TEACHER,
              createdAt: DateTime.fromISO('2021-07-02T09:00:00').toJSDate(),
            },
          },
        },
      });
      await prismaRepository.school.create({
        data: {
          name: '두번째 구독 취소 학교',
          region: SchoolRegionType.BUSAN,
          schoolMemberList: {
            create: {
              userId: user.id,
              nickname: '학교장홍길동',
              role: SchoolUserRole.TEACHER,
              createdAt: DateTime.fromISO('2021-07-02T10:00:00').toJSDate(),
              deletedAt: new Date(),
            },
          },
        },
      });
      await prismaRepository.school.create({
        data: {
          name: '첫번째 학교',
          region: SchoolRegionType.BUSAN,
          schoolMemberList: {
            create: {
              userId: user.id,
              nickname: '학교장홍길동',
              role: SchoolUserRole.TEACHER,
              createdAt: DateTime.fromISO('2021-07-02T15:00:00').toJSDate(),
            },
          },
        },
      });

      // when
      // 학교 구독 리스트 조회
      const result = await schoolMemberService.getList({ userId: user.id, page: 1, size: 10 });

      // then
      expect(result).toHaveProperty('total', 2);
      expect(result.list[0]).toHaveProperty('schoolName', '첫번째 학교');
      expect(result.list[1]).toHaveProperty('schoolName', '네번째 학교');
    });
  });
});
