import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { SchoolMemberController } from './school-member.controller';
import { SCHOOL_MEMBER_SERVICE } from './type/school-member.interface';
import { PrismaModule } from '../common/prisma/prisma.module';
import { SchoolMemberService } from './school-member.service';
import { SchoolMemberEventHandler } from './school-member.event-handler';

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [SchoolMemberController],
  providers: [{ provide: SCHOOL_MEMBER_SERVICE, useClass: SchoolMemberService }, SchoolMemberEventHandler],
})
export class SchoolMemberModule {}
