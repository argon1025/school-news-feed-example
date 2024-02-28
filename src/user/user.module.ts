import { Module } from '@nestjs/common';
import { USER_SERVICE } from './type/user.service.interface';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [{ provide: USER_SERVICE, useClass: UserService }],
  controllers: [UserController],
  exports: [USER_SERVICE],
})
export class UserModule {}
