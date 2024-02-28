import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { SchoolUserRole } from '@prisma/client';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { USER_SERVICE, UserServiceBase } from '../user/type/user.service.interface';
import { CreateOptions, CreateResult, SchoolNewsServiceBase } from './type/school-news.service.interface';
import { ERROR } from '../common/exception/all-exception/error.constant';

@Injectable()
export class SchoolNewsService implements SchoolNewsServiceBase {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserServiceBase,
    private readonly prismaRepository: PrismaRepository,
  ) {}

  /** 소식 생성 */
  async create(options: CreateOptions): Promise<CreateResult> {
    const { userId, schoolId, title, content } = options;

    // 유저 정보가 유효한지 확인
    await this.userService.findOne({ id: userId });

    // 학교가 유효한지 확인
    const school = await this.prismaRepository.school.findUnique({ where: { id: schoolId, deletedAt: null } });
    if (!school) {
      throw new NotFoundException(ERROR.SCHOOL_NOT_FOUND);
    }

    // 멤버 정보가 유효한지 확인
    const schoolMember = await this.prismaRepository.schoolMember.findFirst({
      where: { userId, schoolId, deletedAt: null },
    });
    // 학교에 속해 있는 멤버인지 확인
    if (!schoolMember) {
      throw new NotFoundException(ERROR.SCHOOL_MEMBER_NOT_FOUND);
    }
    // 소식을 작성할 권한이 있는지 확인
    if (schoolMember.role !== SchoolUserRole.TEACHER) {
      throw new NotFoundException(ERROR.SCHOOL_PERMISSION_CHECK);
    }

    // 소식 생성
    try {
      const result = await this.prismaRepository.schoolNews.create({
        data: {
          schoolMemberId: schoolMember.id,
          schoolId,
          title,
          content,
        },
      });
      return { id: result.id };
    } catch (error) {
      Logger.error('학교 소식 생성 실패', error, 'SchoolNewsService.create');
      throw new NotFoundException(ERROR.INTERNAL_SERVER_ERROR);
    }
  }
}
