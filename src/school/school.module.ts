import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { SchoolController } from './school.controller';
import { SCHOOL_SERVICE } from './type/school.service.interface';
import { SchoolService } from './school.service';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [SchoolController],
  providers: [{ provide: SCHOOL_SERVICE, useClass: SchoolService }],
  exports: [],
})
export class SchoolModule {}
