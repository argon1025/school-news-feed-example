import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteSchoolNewsRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '유저 아이디', example: '7f2023de-6c27-4e01-bb14-30c975315f6a' })
  userId: string;
}

@Exclude()
export class DeleteSchoolNewsResponse {
  @Expose()
  @ApiProperty({ description: '삭제된 소식 ID', example: '7f2023de-6c27-4e01-bb14-30c975315f6a' })
  schoolNewsId: string;
}
