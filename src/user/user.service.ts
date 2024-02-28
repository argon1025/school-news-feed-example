import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import {
  CreateOptions,
  CreateResult,
  FindOneOptions,
  FindOneResult,
  UserRoleType,
  UserServiceBase,
} from './type/user.service.interface';
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

  /** 유저 정보 조회 by UserId */
  async findOne(options: FindOneOptions): Promise<FindOneResult> {
    const { id } = options;
    const user = await this.prismaRepository.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) {
      throw new NotFoundException(ERROR.USER_NOT_FOUND);
    }

    return {
      id: user.id,
      name: user.name,
      role: UserRoleType[user.role],
    };
  }
}
