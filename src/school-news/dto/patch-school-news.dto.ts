import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class PatchSchoolNewsRequest {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  @ApiProperty({ description: '제목', example: '학교 소식 제목' })
  title: string;

  @IsString()
  @IsOptional()
  @Length(1, 1000)
  @ApiProperty({ description: '내용', example: '학교 소식 내용' })
  content: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '유저 아이디', example: '7f2023de-6c27-4e01-bb14-30c975315f6a' })
  userId: string;
}

@Exclude()
export class PatchSchoolNewsResponse {
  @Expose()
  @ApiProperty({ description: '소식 ID', example: '7f2023de-6c27-4e01-bb14-30c975315f6a' })
  schoolNewsId: string;
}
