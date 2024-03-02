import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { CreateSchoolEventPayload, SCHOOL_EVENT } from '../school/type/school-event.type';
import { SchoolMemberRoleType } from '../common/type/common.type';

@Injectable()
export class SchoolMemberEventHandler {
  constructor(private readonly prismaRepository: PrismaRepository) {}

  /**
   * 학교 생성 이벤트 핸들러
   * - 학교를 생성한 유저는 학교 관리자 멤버에 추가된다.
   */
  @OnEvent(SCHOOL_EVENT.SCHOOL_CREATE, { async: true })
  async handleSchoolCreate(payload: CreateSchoolEventPayload) {
    const { userId, schoolId, nickname } = payload;

    // 학교 멤버 생성
    try {
      await this.prismaRepository.schoolMember.create({
        data: {
          userId,
          schoolId,
          nickname,
          role: SchoolMemberRoleType.TEACHER,
        },
      });
    } catch (error) {
      Logger.error('학교 멤버 생성 실패', error, 'SchoolMemberEventHandler.handleSchoolCreate');
    }
  }
}
