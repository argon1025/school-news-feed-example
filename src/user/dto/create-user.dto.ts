import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { UserRoleType } from '../../common/type/common.type';

export class CreateUserRequest {
  @IsString()
  @ApiProperty({ example: '홍길동' })
  name: string;

  @IsEnum(UserRoleType)
  @ApiProperty({ example: 'STUDENT', enum: UserRoleType })
  role: UserRoleType;
}

@Exclude()
export class CreateUserResponse {
  @Expose()
  @IsString()
  @ApiProperty({ example: '유저 ID' })
  id: string;
}
