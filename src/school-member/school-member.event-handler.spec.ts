import { Test } from '@nestjs/testing';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PrismaRepository } from '../common/prisma/prisma.repository';
import { SchoolMemberEventHandler } from './school-member.event-handler';
import { UserRoleType, SchoolRegionType, SchoolMemberRoleType } from '../common/type/common.type';
import { CreateSchoolEventPayload, SCHOOL_EVENT } from '../school/type/school-event.type';

describe('SchoolMemberEventHandler', () => {
  let schoolMemberEventHandler: SchoolMemberEventHandler;
  let prismaRepository: PrismaRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [SchoolMemberEventHandler],
    }).compile();

    schoolMemberEventHandler = moduleRef.get<SchoolMemberEventHandler>(SchoolMemberEventHandler);
    prismaRepository = moduleRef.get<PrismaRepository>(PrismaRepository);
  });

  beforeEach(async () => {
    await prismaRepository.$transaction([
      prismaRepository.schoolNews.deleteMany(),
      prismaRepository.schoolMember.deleteMany(),
      prismaRepository.school.deleteMany(),
      prismaRepository.newsFeed.deleteMany(),
      prismaRepository.user.deleteMany(),
    ]);
    jest.restoreAllMocks();
  });

  describe('handleSchoolCreate', () => {
    it('학교를 생성한 유저는 학교 관리자 멤버에 추가된다.', async () => {
      // given
      const student = await prismaRepository.user.create({
        data: {
          name: '김길동',
          role: UserRoleType.TEACHER,
        },
      });
      // 테스트 학교 생성
      const school = await prismaRepository.school.create({
        data: {
          name: '테스트학교',
          region: SchoolRegionType.BUSAN,
        },
      });
      const eventPayload: CreateSchoolEventPayload = {
        eventType: SCHOOL_EVENT.SCHOOL_CREATE,
        userId: student.id,
        schoolId: school.id,
        nickname: '테스트학교 관리자',
      };

      // when
      await schoolMemberEventHandler.handleSchoolCreate(eventPayload);

      // then
      const schoolMember = await prismaRepository.schoolMember.findFirst({
        where: {
          userId: student.id,
        },
      });
      expect(schoolMember).toHaveProperty('userId', student.id);
      expect(schoolMember).toHaveProperty('schoolId', school.id);
      expect(schoolMember).toHaveProperty('nickname', '테스트학교 관리자');
      expect(schoolMember).toHaveProperty('role', SchoolMemberRoleType.TEACHER);
    });
  });
});
