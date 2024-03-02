import { ForbiddenException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateOptions, CreateResult, SchoolServiceBase } from './type/school.service.interface';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { USER_SERVICE, UserServiceBase } from '../user/type/user.service.interface';
import { ERROR } from '../common/exception/all-exception/error.constant';
import { SchoolMemberRoleType, UserRoleType } from '../common/type/common.type';

@Injectable()
export class SchoolService implements SchoolServiceBase {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserServiceBase,
    private readonly prismaRepository: PrismaRepository,
  ) {}

  async create(options: CreateOptions): Promise<CreateResult> {
    const { userId, name, region, nickname } = options;

    // 유저 정보 조회
    const user = await this.userService.findOne({ id: userId });
    // 선생님이 아닌 경우
    if (user.role !== UserRoleType.TEACHER) {
      throw new ForbiddenException(ERROR.SCHOOL_CREATE_TEACHER_ONLY);
    }

    // 학교 생성 & 관리자 등록
    try {
      const result = await this.prismaRepository.school.create({
        data: {
          name,
          region,
          schoolMemberList: {
            create: {
              userId,
              nickname,
              role: SchoolMemberRoleType.TEACHER,
            },
          },
        },
      });
      return { id: result.id };
    } catch (error) {
      Logger.error('학교 생성 실패', error, 'SchoolService.create');
      throw new InternalServerErrorException(ERROR.INTERNAL_SERVER_ERROR);
    }
  }
}
