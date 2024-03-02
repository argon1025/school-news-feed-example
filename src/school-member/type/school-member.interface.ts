import { SchoolMemberRoleType } from '../../common/type/common.type';

export const SCHOOL_MEMBER_SERVICE = Symbol('SCHOOL_MEMBER_SERVICE');

/**
 * 외부 객체에서 학교 구성원 관리 서비스를 사용하기 위한 인터페이스 for DIP
 */

export interface SchoolMemberServiceBase {
  /** 학교 구독 */
  join(options: JoinOptions): Promise<JoinResult>;
}

/** 학교 구독 */
export interface JoinOptions {
  /** 유저 아이디 */
  userId: string;

  /** 별명 */
  nickname: string;

  /** 권한 */
  role: SchoolMemberRoleType;

  /** 학교 아이디 */
  schoolId: string;
}

/** 학교 구독 결과 */
export interface JoinResult {
  /** 멤버 아이디 (학교 멤버로 소속) */
  schoolMemberId: string;
}
