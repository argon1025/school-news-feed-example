import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateOptions, CreateResult, UserServiceBase } from './type/user.service.interface';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { ERROR } from '../common/exception/all-exception/error.constant';

@Injectable()
export class UserService implements UserServiceBase {
  constructor(private readonly prismaRepository: PrismaRepository) {}

  /** 유저 생성 */
  async create(options: CreateOptions): Promise<CreateResult> {
    const { name, role } = options;
    try {
      const user = await this.prismaRepository.user.create({
        data: {
          name,
          role,
        },
      });
      return { id: user.id };
    } catch (error) {
      Logger.error('유저 생성 실패', error, 'UserService.create');
      throw new InternalServerErrorException(ERROR.INTERNAL_SERVER_ERROR);
    }
  }
}
