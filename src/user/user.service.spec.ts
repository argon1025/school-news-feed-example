import { Test } from '@nestjs/testing';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { CreateOptions, USER_SERVICE } from './type/user.service.interface';
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
    await prismaRepository.user.deleteMany({});
  });

  describe('create', () => {
    it('학생을 생성한 경우', async () => {
      // given
      const userCase: CreateOptions = {
        name: '홍길동',
        role: 'STUDENT',
      };

      // when
      const result = await userService.create(userCase);

      // then
      const user = await prismaRepository.user.findUnique({ where: { id: result.id } });
      expect(user).toBeDefined();
      expect(user).toHaveProperty('name', '홍길동');
      expect(user).toHaveProperty('role', 'STUDENT');
    });
    it('선생님을 생성한 경우', async () => {
      // given
      const userCase: CreateOptions = {
        name: '김길동',
        role: 'TEACHER',
      };

      // when
      const result = await userService.create(userCase);

      // then
      const user = await prismaRepository.user.findUnique({ where: { id: result.id } });
      expect(user).toBeDefined();
      expect(user).toHaveProperty('name', '김길동');
      expect(user).toHaveProperty('role', 'TEACHER');
    });
    it('유저 생성에 실패한 경우', async () => {
      // given
      jest.spyOn(prismaRepository.user, 'create').mockRejectedValue(new Error('에러'));
      jest.spyOn(Logger, 'error').mockImplementation();

      // when
      const errorCase = userService.create({ name: '홍길동', role: 'STUDENT' });

      // then
      await expect(errorCase).rejects.toThrow(new InternalServerErrorException(ERROR.INTERNAL_SERVER_ERROR));
    });
  });
});
