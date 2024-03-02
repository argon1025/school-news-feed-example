import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import {
  GetListOptions,
  GetListResult,
  JoinOptions,
  JoinResult,
  LeaveOptions,
  LeaveResult,
  SchoolMemberServiceBase,
} from './type/school-member.interface';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { ERROR } from '../common/exception/all-exception/error.constant';
import { USER_SERVICE, UserServiceBase } from '../user/type/user.service.interface';
import { SchoolMemberRoleType } from '../common/type/common.type';

@Injectable()
export class SchoolMemberService implements SchoolMemberServiceBase {
  constructor(
    private readonly prismaRepository: PrismaRepository,
    @Inject(USER_SERVICE) private readonly userService: UserServiceBase,
  ) {}

  /** 학교 구독 */
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

  /** 학교 구독 해지 */
  async leave(options: LeaveOptions): Promise<LeaveResult> {
    const { schoolMemberId } = options;

    // 학교 멤버 조회
    const schoolMember = await this.prismaRepository.schoolMember.findUnique({
      where: { id: schoolMemberId, deletedAt: null },
    });
    if (!schoolMember) {
      throw new NotFoundException(ERROR.MEMBER_NOT_FOUND);
    }

    // 학교 멤버 삭제
    try {
      const result = await this.prismaRepository.schoolMember.update({
        where: { id: schoolMemberId },
        data: { deletedAt: DateTime.utc().toJSDate() },
      });
      return {
        schoolId: result.schoolId,
      };
    } catch (error) {
      Logger.error('학교 멤버 구독 해지 실패', error, 'SchoolMemberService.leave');
      throw new InternalServerErrorException(ERROR.INTERNAL_SERVER_ERROR);
    }
  }

  /** 구독중인 학교 리스트 조회 */
  async getList(options: GetListOptions): Promise<GetListResult> {
    const { userId, page, size } = options;

    const whereQuery = {
      userId,
      deletedAt: null,
      schoolInfo: { deletedAt: null },
    };
    const list = await this.prismaRepository.schoolMember.findMany({
      select: {
        id: true,
        schoolId: true,
        role: true,
        nickname: true,
        createdAt: true,
        schoolInfo: {
          select: {
            name: true,
            region: true,
          },
        },
      },
      where: whereQuery,
      take: size,
      skip: (page - 1) * size,
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.prismaRepository.schoolMember.count({ where: whereQuery });

    return {
      total,
      list: list.map(({ schoolInfo, ...memberInfo }) => ({
        schoolMemberId: memberInfo.id,
        schoolId: memberInfo.schoolId,
        schoolName: schoolInfo.name,
        region: schoolInfo.region,
        role: SchoolMemberRoleType[memberInfo.role],
        nickname: memberInfo.nickname,
        createdAt: DateTime.fromJSDate(memberInfo.createdAt, { zone: 'UTC' }).toISO(),
      })),
    };
  }
}
