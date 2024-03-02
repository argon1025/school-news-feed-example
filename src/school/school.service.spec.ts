import { Test } from '@nestjs/testing';
import { ForbiddenException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaModule } from '../common/prisma/prisma.module';
import { SchoolService } from './school.service';
import { UserService } from '../user/user.service';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { USER_SERVICE } from '../user/type/user.service.interface';
import { SCHOOL_SERVICE } from './type/school.service.interface';
import { ERROR } from '../common/exception/all-exception/error.constant';
import { SchoolRegionType, UserRoleType } from '../common/type/common.type';

describe('SchoolService', () => {
  let userService: UserService;
  let schoolService: SchoolService;
  let prismaRepository: PrismaRepository;
  const eventEmitter = { emit: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        { provide: USER_SERVICE, useClass: UserService },
        { provide: SCHOOL_SERVICE, useClass: SchoolService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    userService = moduleRef.get<UserService>(USER_SERVICE);
    schoolService = moduleRef.get<SchoolService>(SCHOOL_SERVICE);
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

  describe('create', () => {
    it('선생님으로 학교를 생성한 경우', async () => {
      // given
      const user = await userService.create({
        name: '홍길동',
        role: UserRoleType.TEACHER,
      });

      // when
      const successCase = await schoolService.create({
        userId: user.id,
        name: '테스트학교',
        region: SchoolRegionType.SEOUL,
        nickname: '학교장홍길동',
      });

      // then
      const school = await prismaRepository.school.findUnique({
        where: { id: successCase.id },
      });
      expect(school).toHaveProperty('name', '테스트학교');
      expect(school).toHaveProperty('region', SchoolRegionType.SEOUL);
    });

    it('학생으로 학교를 생성한 경우', async () => {
      // given
      const user = await userService.create({
        name: '홍길동',
        role: UserRoleType.STUDENT,
      });

      // when
      const errorCase = schoolService.create({
        userId: user.id,
        name: '테스트학교',
        region: SchoolRegionType.SEOUL,
        nickname: '사실은 학생인 홍길동',
      });

      // then
      await expect(errorCase).rejects.toThrow(new ForbiddenException(ERROR.SCHOOL_CREATE_TEACHER_ONLY));
    });

    it('탈퇴한 유저가 학교생성을 시도한 경우', async () => {
      // given
      const user = await prismaRepository.user.create({
        data: { name: '홍길동', role: UserRoleType.TEACHER, deletedAt: new Date() },
      });

      // when
      const errorCase = schoolService.create({
        userId: user.id,
        name: '테스트학교',
        region: SchoolRegionType.SEOUL,
        nickname: '탈퇴한 학교장 홍길동',
      });

      // then
      await expect(errorCase).rejects.toThrow(new NotFoundException(ERROR.USER_NOT_FOUND));
    });

    it('학교 생성에 실패한경우', async () => {
      // given
      jest.spyOn(prismaRepository.school, 'create').mockRejectedValue(new Error('DB 오류'));
      jest.spyOn(Logger, 'error').mockImplementation();
      const user = await userService.create({
        name: '홍길동',
        role: UserRoleType.TEACHER,
      });

      // when
      const errorCase = schoolService.create({
        userId: user.id,
        name: '테스트학교',
        region: SchoolRegionType.SEOUL,
        nickname: '학생홍길동',
      });

      // then
      await expect(errorCase).rejects.toThrow(new InternalServerErrorException(ERROR.INTERNAL_SERVER_ERROR));
    });
  });
});
