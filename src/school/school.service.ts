import { ForbiddenException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateOptions, CreateResult, SchoolServiceBase } from './type/school.service.interface';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { USER_SERVICE, UserServiceBase } from '../user/type/user.service.interface';
import { ERROR } from '../common/exception/all-exception/error.constant';
import { UserRoleType } from '../common/type/common.type';
import { CreateSchoolEventPayload, SCHOOL_EVENT } from './type/school-event.type';

@Injectable()
export class SchoolService implements SchoolServiceBase {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserServiceBase,
    private readonly prismaRepository: PrismaRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** 학교 페이지 생성 */
  async create(options: CreateOptions): Promise<CreateResult> {
    const { userId, name, region, nickname } = options;

    // 유저 정보 조회
    const user = await this.userService.findOne({ id: userId });
    // 선생님이 아닌 경우
    if (user.role !== UserRoleType.TEACHER) {
      throw new ForbiddenException(ERROR.SCHOOL_CREATE_TEACHER_ONLY);
    }

    // 학교 생성 & 관리자 등록
    let schoolId = '';
    try {
      const result = await this.prismaRepository.school.create({
        data: {
          name,
          region,
        },
      });
      schoolId = result.id;
    } catch (error) {
      Logger.error('학교 생성 실패', error, 'SchoolService.create');
      throw new InternalServerErrorException(ERROR.INTERNAL_SERVER_ERROR);
    }

    // 생성 이벤트 발행
    try {
      const payload: CreateSchoolEventPayload = {
        eventType: SCHOOL_EVENT.SCHOOL_CREATE,
        userId,
        schoolId,
        nickname,
      };

      this.eventEmitter.emit(SCHOOL_EVENT.SCHOOL_CREATE, payload);
    } catch (error) {
      Logger.error('학교 생성 이벤트 발행 실패', error, 'SchoolService.create');
      throw new InternalServerErrorException(ERROR.INTERNAL_SERVER_ERROR);
    }

    return { id: schoolId };
  }
}
