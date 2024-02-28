import { Test } from '@nestjs/testing';
import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { CreateOptions, USER_SERVICE, UserRoleType } from './type/user.service.interface';
import { UserService } from './user.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ERROR } from '../common/exception/all-exception/error.constant';

describe('UserService', () => {
  let userService: UserService;
  let prismaRepository: PrismaRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [{ provide: USER_SERVICE, useClass: UserService }],
    }).compile();

    userService = moduleRef.get<UserService>(USER_SERVICE);
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
    it('학생을 생성한 경우', async () => {
      // given
      const userCase: CreateOptions = {
        name: '홍길동',
        role: UserRoleType.STUDENT,
      };

      // when
      const result = await userService.create(userCase);

      // then
      const user = await prismaRepository.user.findUnique({ where: { id: result.id } });
      expect(user).toBeDefined();
      expect(user).toHaveProperty('name', '홍길동');
      expect(user).toHaveProperty('role', UserRoleType.STUDENT);
    });

    it('선생님을 생성한 경우', async () => {
      // given
      const userCase: CreateOptions = {
        name: '김길동',
        role: UserRoleType.TEACHER,
      };

      // when
      const result = await userService.create(userCase);

      // then
      const user = await prismaRepository.user.findUnique({ where: { id: result.id } });
      expect(user).toBeDefined();
      expect(user).toHaveProperty('name', '김길동');
      expect(user).toHaveProperty('role', UserRoleType.TEACHER);
    });

    it('유저 생성에 실패한 경우', async () => {
      // given
      jest.spyOn(prismaRepository.user, 'create').mockRejectedValue(new Error('에러'));
      jest.spyOn(Logger, 'error').mockImplementation();

      // when
      const errorCase = userService.create({ name: '홍길동', role: UserRoleType.STUDENT });

      // then
      await expect(errorCase).rejects.toThrow(new InternalServerErrorException(ERROR.INTERNAL_SERVER_ERROR));
    });
  });

  describe('findOne', () => {
    it('유저를 찾았을 경우', async () => {
      // given
      const user = await prismaRepository.user.create({ data: { name: '홍길동', role: UserRoleType.STUDENT } });

      // when
      const result = await userService.findOne({ id: user.id });

      // then
      expect(result).toHaveProperty('id', user.id);
      expect(result).toHaveProperty('name', user.name);
      expect(result).toHaveProperty('role', user.role);
    });

    it('유저를 찾지 못했을 경우', async () => {
      // when&then
      const errorCase = userService.findOne({ id: 'notExistId' });

      await expect(errorCase).rejects.toThrow(new NotFoundException(ERROR.USER_NOT_FOUND));
    });

    it('삭제된 유저인 경우', async () => {
      // given
      const user = await prismaRepository.user.create({
        data: { name: '홍길동', role: UserRoleType.STUDENT, deletedAt: new Date() },
      });

      // when
      const errorCase = userService.findOne({ id: user.id });

      // then
      await expect(errorCase).rejects.toThrow(new NotFoundException(ERROR.USER_NOT_FOUND));
    });
  });
});
