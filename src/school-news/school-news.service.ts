import { Injectable, Inject, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { USER_SERVICE, UserServiceBase } from '../user/type/user.service.interface';
import {
  CreateOptions,
  CreateResult,
  DeleteOptions,
  DeleteResult,
  GetListOptions,
  GetListResult,
  SchoolNewsRoleType,
  SchoolNewsServiceBase,
  UpdateOptions,
  UpdateResult,
} from './type/school-news.service.interface';
import { ERROR } from '../common/exception/all-exception/error.constant';
import { CreateSchoolNewsEventPayload, SCHOOL_NEWS_EVENT, UpdateSchoolNewsEventPayload } from './type/school-news-event.type';

@Injectable()
export class SchoolNewsService implements SchoolNewsServiceBase {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserServiceBase,
    private readonly prismaRepository: PrismaRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** 소식 리스트 조회 */
  async getList(options: GetListOptions): Promise<GetListResult> {
    const { schoolId, page, size } = options;

    const whereQuery = {
      schoolId,
      deletedAt: null,
      schoolInfo: { deletedAt: null },
    };
    const newsList = await this.prismaRepository.schoolNews.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        schoolMemberId: true,
        createdAt: true,
        updatedAt: true,
        writerInfo: {
          select: {
            id: true,
            nickname: true,
            userId: true,
            role: true,
          },
        },
      },
      where: whereQuery,
      skip: (page - 1) * size,
      take: size,
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.prismaRepository.schoolNews.count({ where: whereQuery });

    return {
      total,
      list: newsList.map((news) => ({
        id: news.id,
        title: news.title,
        content: news.content,
        schoolMemberId: news.schoolMemberId,
        writerInfo: {
          id: news.writerInfo.id,
          nickname: news.writerInfo.nickname,
          userId: news.writerInfo.userId,
          role: SchoolNewsRoleType[news.writerInfo.role],
        },
        createdAt: DateTime.fromJSDate(news.createdAt, { zone: 'UTC' }).toISO(),
        updatedAt: DateTime.fromJSDate(news.updatedAt, { zone: 'UTC' }).toISO(),
      })),
    };
  }

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
    if (schoolMember.role !== SchoolNewsRoleType.TEACHER) {
      throw new ForbiddenException(ERROR.SCHOOL_PERMISSION_CHECK);
    }

    // 소식 생성
    let schoolNewsId: string;
    try {
      const result = await this.prismaRepository.schoolNews.create({
        data: {
          schoolMemberId: schoolMember.id,
          schoolId,
          title,
          content,
        },
      });
      schoolNewsId = result.id;
    } catch (error) {
      Logger.error('학교 소식 생성 실패', error, 'SchoolNewsService.create');
      throw new NotFoundException(ERROR.INTERNAL_SERVER_ERROR);
    }

    // 생성 이벤트 발행
    try {
      const payload: CreateSchoolNewsEventPayload = {
        eventType: SCHOOL_NEWS_EVENT.SCHOOL_NEWS_CREATE,
        schoolNewsId,
      };
      this.eventEmitter.emit(SCHOOL_NEWS_EVENT.SCHOOL_NEWS_CREATE, payload);
    } catch (error) {
      Logger.error('학교 소식 생성 이벤트 발행 실패', error, 'SchoolNewsService.create');
      throw new NotFoundException(ERROR.INTERNAL_SERVER_ERROR);
    }

    return { id: schoolNewsId };
  }

  /** 소식 수정 */
  async update(options: UpdateOptions): Promise<UpdateResult> {
    const { id, userId, title, content } = options;

    // 유저 정보가 유효한지 확인
    await this.userService.findOne({ id: userId });

    // 소식이 유효한지 확인
    const schoolNews = await this.prismaRepository.schoolNews.findUnique({ where: { id, deletedAt: null } });
    if (!schoolNews) {
      throw new NotFoundException(ERROR.SCHOOL_NEWS_NOT_FOUND);
    }

    // 멤버 정보가 유효한지 확인
    const schoolMember = await this.prismaRepository.schoolMember.findFirst({
      where: { userId, schoolId: schoolNews.schoolId, deletedAt: null },
    });
    // 학교에 속해 있는 멤버인지 확인
    if (!schoolMember) {
      throw new NotFoundException(ERROR.SCHOOL_MEMBER_NOT_FOUND);
    }
    // 소식을 수정할 권한이 있는지 확인
    if (schoolMember.role !== SchoolNewsRoleType.TEACHER) {
      throw new ForbiddenException(ERROR.SCHOOL_PERMISSION_CHECK);
    }

    // 소식 수정
    let schoolNewsId: string;
    try {
      const result = await this.prismaRepository.schoolNews.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
        },
      });
      schoolNewsId = result.id;
    } catch (error) {
      Logger.error('학교 소식 수정 실패', error, 'SchoolNewsService.update');
      throw new NotFoundException(ERROR.INTERNAL_SERVER_ERROR);
    }

    // 수정 이벤트 발행
    try {
      const payload: UpdateSchoolNewsEventPayload = {
        eventType: SCHOOL_NEWS_EVENT.SCHOOL_NEWS_UPDATE,
        schoolNewsId,
      };
      this.eventEmitter.emit(SCHOOL_NEWS_EVENT.SCHOOL_NEWS_UPDATE, payload);
    } catch (error) {
      Logger.error('학교 소식 수정 이벤트 발행 실패', error, 'SchoolNewsService.update');
      throw new NotFoundException(ERROR.INTERNAL_SERVER_ERROR);
    }

    return { id: schoolNewsId };
  }

  /** 소식 삭제 */
  async delete(options: DeleteOptions): Promise<DeleteResult> {
    const { id, userId } = options;

    // 유저 정보가 유효한지 확인
    await this.userService.findOne({ id: userId });

    // 소식이 유효한지 확인
    const schoolNews = await this.prismaRepository.schoolNews.findUnique({ where: { id, deletedAt: null } });
    if (!schoolNews) {
      throw new NotFoundException(ERROR.SCHOOL_NEWS_NOT_FOUND);
    }

    // 멤버 정보가 유효한지 확인
    const schoolMember = await this.prismaRepository.schoolMember.findFirst({
      where: { userId, schoolId: schoolNews.schoolId, deletedAt: null },
    });
    // 학교에 속해 있는 멤버인지 확인
    if (!schoolMember) {
      throw new NotFoundException(ERROR.SCHOOL_MEMBER_NOT_FOUND);
    }
    // 소식을 수정할 권한이 있는지 확인
    if (schoolMember.role !== SchoolNewsRoleType.TEACHER) {
      throw new ForbiddenException(ERROR.SCHOOL_PERMISSION_CHECK);
    }

    // 소식 삭제
    let schoolNewsId: string;
    try {
      const result = await this.prismaRepository.schoolNews.update({
        where: { id },
        data: {
          deletedAt: DateTime.utc().toJSDate(),
        },
      });
      schoolNewsId = result.id;
    } catch (error) {
      Logger.error('학교 소식 삭제 실패', error, 'SchoolNewsService.delete');
      throw new NotFoundException(ERROR.INTERNAL_SERVER_ERROR);
    }

    // 삭제 이벤트 발행
    try {
      const payload: CreateSchoolNewsEventPayload = {
        eventType: SCHOOL_NEWS_EVENT.SCHOOL_NEWS_DELETE,
        schoolNewsId,
      };
      this.eventEmitter.emit(SCHOOL_NEWS_EVENT.SCHOOL_NEWS_DELETE, payload);
    } catch (error) {
      Logger.error('학교 소식 삭제 이벤트 발행 실패', error, 'SchoolNewsService.delete');
      throw new NotFoundException(ERROR.INTERNAL_SERVER_ERROR);
    }

    return { id: schoolNewsId };
  }
}
