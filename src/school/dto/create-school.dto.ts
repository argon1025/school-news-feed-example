import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { SchoolRegionType } from '../type/school.service.interface';

export class CreateSchoolRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '유저 아이디', example: '123jh3h5j4j323kj543jk' })
  userId: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @ApiProperty({ description: '학교 명', example: '예제고등학교' })
  name: string;

  @IsEnum(SchoolRegionType)
  @IsNotEmpty()
  @ApiProperty({ description: '학교 지역', enum: SchoolRegionType, example: SchoolRegionType.SEOUL })
  region: SchoolRegionType;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @ApiProperty({ description: '유저 닉네임', example: '학교페이지에서 사용할 이름' })
  nickname: string;
}

@Exclude()
export class CreateSchoolResponse {
  @Expose()
  schoolId: string;
}
