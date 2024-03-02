import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { JoinOptions, JoinResult, SchoolMemberServiceBase } from './type/school-member.interface';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { ERROR } from '../common/exception/all-exception/error.constant';
import { USER_SERVICE, UserServiceBase } from '../user/type/user.service.interface';

@Injectable()
export class SchoolMemberService implements SchoolMemberServiceBase {
  constructor(
    private readonly prismaRepository: PrismaRepository,
    @Inject(USER_SERVICE) private readonly userService: UserServiceBase,
  ) {}

  async join(options: JoinOptions): Promise<JoinResult> {
    const { userId, nickname, role, schoolId } = options;

    // 유저 정보 조회
    await this.userService.findOne({ id: userId });

    // 학교가 유효한지 확인
    const school = await this.prismaRepository.school.findUnique({ where: { id: schoolId, deletedAt: null } });
    if (!school) {
      throw new NotFoundException(ERROR.SCHOOL_NOT_FOUND);
    }

    // 이미 가입된 멤버인지 확인
    const alreadyJoined = await this.prismaRepository.schoolMember.findFirst({
      where: { userId, schoolId, deletedAt: null },
    });
    if (alreadyJoined) {
      throw new BadRequestException(ERROR.ALREADY_JOINED);
    }

    // 학교 멤버 생성
    try {
      const schoolMember = await this.prismaRepository.schoolMember.create({
        data: {
          userId,
          nickname,
          role,
          schoolId,
        },
      });
      return {
        schoolMemberId: schoolMember.id,
      };
    } catch (error) {
      Logger.error('학교 멤버 구독 실패', error, 'SchoolMemberService.join');
      throw new InternalServerErrorException(ERROR.INTERNAL_SERVER_ERROR);
    }
  }
}
