import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DeleteSchoolMemberResponse {
  @Expose()
  @ApiProperty({ description: '학교 구독 아이디', example: '91619bb0-8d40-4d6c-882b-92916ebf8c2d' })
  schoolMemberId: string;
}
