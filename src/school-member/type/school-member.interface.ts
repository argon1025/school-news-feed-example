import { SchoolMemberRoleType } from '../../common/type/common.type';

export const SCHOOL_MEMBER_SERVICE = Symbol('SCHOOL_MEMBER_SERVICE');

/**
 * 외부 객체에서 학교 구성원 관리 서비스를 사용하기 위한 인터페이스 for DIP
 */

export interface SchoolMemberServiceBase {
  /** 학교 구독 */
  join(options: JoinOptions): Promise<JoinResult>;

  /** 학교 구독 해지 */
  leave(options: LeaveOptions): Promise<LeaveResult>;

  /** 구독한 학교 페이지 리스트 */
  getList(options: GetListOptions): Promise<GetListResult>;
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

/** 학교 구독 해지 */
export interface LeaveOptions {
  /** 학교 아이디 */
  schoolId: string;
  /** 유저 아이디 */
  userId: string;
}

/** 학교 구독 해지 결과 */
export interface LeaveResult {
  /** 학교 아이디 */
  schoolId: string;
}

/** 구독한 학교 페이지 리스트 */
export interface GetListOptions {
  /** 유저 아이디 */
  userId: string;
  /** 페이지 */
  page: number;
  /** 페이지 크기 */
  size: number;
}

/** 구독한 학교 페이지 리스트 결과 */
export interface GetListResult {
  /** 토탈 */
  total: number;

  /** 학교 리스트 */
  list: {
    /** 학교 멤버 아이디 */
    schoolMemberId: string;
    /** 학교 아이디 */
    schoolId: string;
    /** 학교 이름 */
    schoolName: string;
    /** 학교 지역 */
    region: string;
    /** 나의 별명 */
    nickname: string;
    /** 나의 권한 */
    role: SchoolMemberRoleType;
    /** 가입일 */
    createdAt: string;
  }[];
}
